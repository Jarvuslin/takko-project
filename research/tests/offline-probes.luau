-- Generated from actual shipped modules; dependency lines replaced with mocks only.
local Log={info=function()end,warn=function()end,debug=function()end,trace=function()end,error=function(...) error('log error') end}
local queued={}
local task={spawn=function(fn) table.insert(queued,fn) return fn end,wait=function() end}
local calls={}
local responseStatus=200
local HttpCore={API_BASE_PATH='mock://local',request=function(method,path,body,headers)
 table.insert(calls,{method=method,path=path,body=body,project=headers and headers['X-Project-Id']})
 return {StatusCode=responseStatus,Body='{}'}
end}
local HttpService={JSONDecode=function()return {}end}
local manifest={package={version='2.2.4'}}
local StudioActionService=(function()
--!strict
-- StudioActionService: Manages polling for Studio action requests from agent
-- Responsible for: polling for requests, executing actions, posting results


export type StudioActionServiceConfig = {
	pollInterval: number?, -- Base poll interval in seconds when active (default: 1s)
	maxPollInterval: number?, -- Max poll interval in seconds when idle (default: 5s)
	idleGracePolls: number?, -- Consecutive empty polls before idle backoff begins (default: 20)
	backoffFactor: number?, -- Interval multiplier per backoff step (default: 2)
}

local StudioActionService = {}
StudioActionService.__index = StudioActionService

function StudioActionService.new(config: StudioActionServiceConfig?)
	local self = setmetatable({}, StudioActionService)

	local cfg = config or {}
	self.pollInterval = cfg.pollInterval or 1.0
	self.maxPollInterval = cfg.maxPollInterval or 5.0
	self.idleGracePolls = cfg.idleGracePolls or 20
	self.backoffFactor = cfg.backoffFactor or 2
	-- Current (possibly backed-off) interval and the run of empty polls that
	-- drives the backoff. Reset to base whenever a request arrives.
	self.currentInterval = self.pollInterval
	self.consecutiveEmptyPolls = 0
	self.isPolling = false
	self.projectId = nil
	self.actionHandlers = nil
	self.__onActionComplete = nil
	self.__onSessionEnded = nil

	return self
end

-- Start polling for Studio action requests
-- @param projectId - The project ID to poll for
-- @param actionHandlers - Module containing action handler functions
function StudioActionService:startPolling(projectId: string, actionHandlers: any)
	if self.isPolling then
		Log.warn("[StudioActionService] Already polling, ignoring start request")
		return
	end

	if not projectId or projectId == "" then
		Log.warn("[StudioActionService] Cannot start polling without projectId")
		return
	end

	self.projectId = projectId
	self.actionHandlers = actionHandlers
	self.isPolling = true

	Log.info("[StudioActionService] Starting polling for project:", projectId)

	-- Start polling loop
	task.spawn(function()
		self:_pollLoop()
	end)
end

-- Stop polling for Studio action requests
function StudioActionService:stopPolling()
	if not self.isPolling then
		return
	end

	Log.info("[StudioActionService] Stopping polling")
	self.isPolling = false
	self.projectId = nil
	self.actionHandlers = nil
end

-- Register callback for action completion notifications
function StudioActionService:onActionComplete(callback: (toolName: string, path: string?, timestamp: number) -> ())
	self.__onActionComplete = callback
end

-- Register callback for when the session ends server-side (e.g. the project's
-- machine is gone). The consumer should disconnect and prompt the user.
function StudioActionService:onSessionEnded(callback: (reason: string) -> ())
	self.__onSessionEnded = callback
end

-- Internal polling loop
function StudioActionService:_pollLoop()
	while self.isPolling do
		local success, result = pcall(function()
			return self:_poll()
		end)

		local hadActivity = false
		if not success then
			Log.warn("[StudioActionService] Poll error:", result)
		else
			hadActivity = result == true
		end

		-- Adapt cadence: stay fast while active, back off when idle.
		self:_updatePollInterval(hadActivity)

		-- Wait before next poll
		task.wait(self.currentInterval)
	end

	Log.info("[StudioActionService] Poll loop ended")
end

-- Adjust poll cadence based on activity. Active sessions poll at the base
-- interval for low latency; idle sessions ramp the interval up exponentially
-- (after a grace window) so connected-but-idle plugins stop saturating the
-- Convex concurrent-Action cap. Any pending request resets to base immediately.
function StudioActionService:_updatePollInterval(hadActivity: boolean)
	if hadActivity then
		if self.currentInterval ~= self.pollInterval then
			Log.info("[StudioActionService] Activity detected, resetting poll interval to base")
		end
		self.consecutiveEmptyPolls = 0
		self.currentInterval = self.pollInterval
		return
	end

	self.consecutiveEmptyPolls += 1

	-- Stay responsive during the grace window after recent activity.
	if self.consecutiveEmptyPolls <= self.idleGracePolls then
		self.currentInterval = self.pollInterval
		return
	end

	-- Past grace: ramp exponentially toward the max idle interval.
	if self.currentInterval < self.maxPollInterval then
		local nextInterval = self.currentInterval * self.backoffFactor
		if nextInterval > self.maxPollInterval then
			nextInterval = self.maxPollInterval
		end
		self.currentInterval = nextInterval
		Log.info(
			string.format(
				"[StudioActionService] Idle backoff: poll interval now %.1fs (empty polls: %d)",
				self.currentInterval,
				self.consecutiveEmptyPolls
			)
		)
	end
end

-- Poll for pending Studio action requests.
-- Returns true when pending requests were received (activity), false otherwise.
function StudioActionService:_poll(): boolean
	if not self.projectId then
		return false
	end

	-- Call Convex proxy endpoint with plugin version
	local pluginVersion = manifest.package.version
	local url = HttpCore.API_BASE_PATH .. "/v2/studio/poll?pluginVersion=" .. pluginVersion
	local res = HttpCore.request("GET", "v2/studio/poll", nil, {
		["X-Override-URL"] = url,
		["X-Project-Id"] = self.projectId,
	})

	if not res then
		Log.trace("[StudioActionService] Poll returned nil response")
		return false
	end

	local statusCode = res.StatusCode

	-- Handle 403 Forbidden (outdated plugin version)
	if statusCode == 403 then
		local ok, decoded = pcall(function()
			return HttpService:JSONDecode(res.Body)
		end)

		if ok and decoded and decoded.message then
			Log.error("[StudioActionService] Plugin version outdated:")
			Log.error(decoded.message)
			-- Stop polling - plugin is outdated and cannot connect
			self:stopPolling()
			error("Plugin version outdated: " .. decoded.message)
		else
			Log.error("[StudioActionService] Plugin version check failed with 403")
			self:stopPolling()
			error("Plugin version check failed")
		end
		return false
	end

	-- Handle 410 Gone (project's machine no longer exists). There is nothing to
	-- poll, so stop and let the consumer disconnect + prompt the user to reconnect.
	-- Distinct from transient 5xx errors, which fall through and keep polling.
	if statusCode == 410 then
		Log.warn("[StudioActionService] Machine gone (410) - ending session")
		self:stopPolling()
		if self.__onSessionEnded then
			self.__onSessionEnded("machine_gone")
		end
		return false
	end

	-- Success with pending requests
	if statusCode == 200 then
		local ok, decoded = pcall(function()
			return HttpService:JSONDecode(res.Body)
		end)

		if not ok then
			Log.warn("[StudioActionService] Failed to decode poll response:", decoded)
			return false
		end

		-- Process pending requests
		if decoded.requests and #decoded.requests > 0 then
			Log.info(string.format("[StudioActionService] Received %d pending request(s)", #decoded.requests))

			-- Each request runs on its own thread so a handler that yields for a long
			-- time (a play session that never ends) cannot block the poll loop and
			-- make every other tool time out.
			for _, request in ipairs(decoded.requests) do
				task.spawn(function()
					self:_executeRequest(request)
				end)
			end
			return true
		elseif decoded.requests and #decoded.requests == 0 then
			Log.info(
				string.format(
					"[StudioActionService] No pending requests (interval %.1fs, empty polls %d)",
					self.currentInterval,
					self.consecutiveEmptyPolls
				)
			)
			return false
		else
			Log.warn("[StudioActionService] No requests in poll response")
			return false
		end
	elseif statusCode ~= 204 then
		-- 204 = no pending requests (expected)
		-- Other status codes are errors
		Log.warn("[StudioActionService] Poll failed with status:", statusCode)
		return false
	end

	-- 204 No Content (no pending requests): idle.
	return false
end

-- Execute a Studio action request
function StudioActionService:_executeRequest(request: {
	requestId: string,
	toolName: string,
	params: { [string]: any },
	timestamp: number,
})
	Log.info(string.format("[StudioActionService] Executing request %s: tool=%s", request.requestId, request.toolName))

	local success, result = pcall(function()
		-- Find handler function
		local handlerName = request.toolName
		local handler = self.actionHandlers[handlerName]

		if not handler then
			error(string.format("No handler found for tool: %s", request.toolName))
		end

		-- Execute handler (pass actionHandlers instance as self)
		return handler(self.actionHandlers, request.params)
	end)

	local resultPayload
	if success then
		-- Handler succeeded
		resultPayload = result
		Log.info(string.format("[StudioActionService] Request %s completed successfully", request.requestId))

		-- Notify callback of successful action completion
		if resultPayload.status == "completed" and self.__onActionComplete then
			local path = resultPayload.path
			self.__onActionComplete(request.toolName, path, request.timestamp)
		end
	else
		-- Handler failed
		resultPayload = {
			status = "failed",
			error = tostring(result),
		}
		Log.warn(string.format("[StudioActionService] Request %s failed: %s", request.requestId, result))
	end

	-- Post result back to VM
	self:_postResult(request.requestId, resultPayload)
end

-- Post execution result back to VM
-- For tiled screenshot results, posts each tile individually to reduce payload size,
-- then posts metadata-only result. Falls back to single POST if tile posting fails.
function StudioActionService:_postResult(requestId: string, result: { [string]: any })
	-- Batch tiles individually if present (screenshot results with multiple tiles)
	if result.tiles and type(result.tiles) == "table" and #result.tiles > 0 then
		local tiles = result.tiles
		local tileCount = #tiles

		Log.info(
			string.format("[StudioActionService] Posting %d tiles individually for request: %s", tileCount, requestId)
		)

		local allTilesPosted = true
		for i, tile in ipairs(tiles) do
			local tileUrl = HttpCore.API_BASE_PATH .. "/v2/studio/tile"
			local tileBody = {
				requestId = requestId,
				tileIndex = i - 1, -- zero-indexed
				tile = tile,
			}

			local tileRes = HttpCore.request("POST", "v2/studio/tile", tileBody, {
				["X-Override-URL"] = tileUrl,
				["X-Project-Id"] = self.projectId or "",
			})

			if not tileRes or tileRes.StatusCode ~= 200 then
				Log.warn(
					string.format(
						"[StudioActionService] Failed to post tile %d/%d for request: %s",
						i,
						tileCount,
						requestId
					)
				)
				allTilesPosted = false
				break
			end

			Log.trace(string.format("[StudioActionService] Posted tile %d/%d for request: %s", i, tileCount, requestId))
		end

		if allTilesPosted then
			-- Replace tiles array with tileCount in metadata
			result.tiles = nil
			result.tileCount = tileCount
		else
			-- Fallback: keep original result with embedded tiles
			Log.warn("[StudioActionService] Tile posting failed, falling back to single POST")
		end
	end

	-- Post result (metadata-only if tiles sent separately, full otherwise).
	-- All studio results go through the gzip-aware route: plugin gzips the
	-- body via RequestAsync's Compress option, and the /v2/studio/result-gzip
	-- Convex action decompresses before forwarding to the VM. The legacy plain
	-- /v2/studio/result route stays available for backwards compatibility with
	-- older plugin builds.
	local url = HttpCore.API_BASE_PATH .. "/v2/studio/result-gzip"
	local body = {
		requestId = requestId,
		result = result,
	}

	local res = HttpCore.request("POST", "v2/studio/result-gzip", body, {
		["X-Override-URL"] = url,
		["X-Project-Id"] = self.projectId or "",
	}, true)

	if not res then
		-- nil means the body could not be JSON-encoded even after HttpCore's
		-- UTF-8 sanitizing. Post a minimal failure so the agent gets an error
		-- instead of hanging until the VM-side timeout.
		Log.warn("[StudioActionService] Result unencodable for request:", requestId, "- posting failure result")
		res = HttpCore.request("POST", "v2/studio/result-gzip", {
			requestId = requestId,
			result = {
				status = "failed",
				error = "Studio result payload could not be JSON-encoded",
			},
		}, {
			["X-Override-URL"] = url,
			["X-Project-Id"] = self.projectId or "",
		}, true)
	end

	if not res then
		Log.warn("[StudioActionService] Failed to post result for request:", requestId)
		return
	end

	if res.StatusCode == 200 then
		Log.trace("[StudioActionService] Result posted successfully for request:", requestId)
	else
		Log.warn("[StudioActionService] Failed to post result, status:", res.StatusCode, "request:", requestId)
	end
end

return StudioActionService

end)()
local observed=0
local function check(name,condition,detail)
 assert(condition, 'Probe did not reproduce: '..name)
 observed+=1
 print('REPRODUCED | '..name..' | '..detail)
end
local s=StudioActionService.new()
local mutations=0
s.projectId='project-A'
s.actionHandlers={createInstance=function()mutations+=1 return {status='completed'}end}
local req={requestId='same-id',toolName='createInstance',params={},timestamp=1}
s:_executeRequest(req)
s:_executeRequest(req)
check('Duplicate delivery executes mutation twice',mutations==2,'No client deduplication; server redelivery policy remains unknown')
calls={};responseStatus=503
s:_postResult('failed-post',{status='completed'})
check('Failed result POST has no client retry',#calls==1,'One HTTP 503 produces one attempt; no persisted outbox in this module')
responseStatus=200;calls={}
s.isPolling=true
s.actionHandlers={slow=function()coroutine.yield()return {status='completed'}end}
local worker=coroutine.create(function()s:_executeRequest({requestId='old-request',toolName='slow',params={},timestamp=1})end)
assert(coroutine.resume(worker))
s:stopPolling()
s:startPolling('project-B',{})
assert(coroutine.resume(worker))
check('In-flight result reads mutable project ID',calls[1].project=='project-B','Old request posted with new project ID on same service object; app normally recreates Core, reducing this specific reachability')
-- Actual application stop path, without restarting the same object.
calls={};s.projectId='project-A';s.isPolling=true
s.actionHandlers={slow=function()coroutine.yield()return {status='completed'}end}
worker=coroutine.create(function()s:_executeRequest({requestId='disconnected-request',toolName='slow',params={},timestamp=1})end)
assert(coroutine.resume(worker));s:stopPolling();assert(coroutine.resume(worker))
check('Disconnect drops in-flight result project header',calls[1].project=='','Running handler survives stopPolling but self.projectId becomes nil')
local helpers={}
local WriteHelpers={}
local PropertyConverter={convertPropertyValue=function(_,value)return value end}
local batchRollback=(function()
--!strict
-- batchRollback: Execute multiple rollback operations atomically
-- Task 048 - LEMON-1052: Operation-based rollback with event sourcing
-- Processes all operations in order, returns per-operation success/failure


-- Import sub-handlers for reuse

-- Types for operations
type DeleteOp = {
	type: "delete",
	uniqueId: string,
	path: string,
}

type UpdateScriptOp = {
	type: "updateScript",
	uniqueId: string,
	path: string,
	content: string,
}

type CreateInstanceOp = {
	type: "createInstance",
	uniqueId: string,
	path: string,
	parentUniqueId: string,
	className: string,
	serialized: string,
	source: string?,
}

type MoveOp = {
	type: "move",
	uniqueId: string,
	newParentUniqueId: string,
	newName: string,
	originalPath: string,
}

type UpdateInstanceOp = {
	type: "updateInstance",
	uniqueId: string,
	path: string,
	properties: { [string]: any },
	attributes: { [string]: any },
}

type BatchOperation = DeleteOp | UpdateScriptOp | CreateInstanceOp | MoveOp | UpdateInstanceOp

type OperationResult = {
	type: string,
	uniqueId: string,
	success: boolean,
	error: string?,
}

-- Helper: Apply properties to an instance (from deserialize.luau)
local function applyProperties(instance: Instance, properties: { [string]: any })
	for propName, value in pairs(properties) do
		-- Handle Model-specific method-based properties
		if propName == "_ModelScale" and instance:IsA("Model") then
			local success, err = pcall(function()
				(instance :: Model):ScaleTo(value)
			end)
			if not success then
				Log.warn(string.format("[batchRollback] Failed to ScaleTo(%s): %s", tostring(value), tostring(err)))
			end
			continue
		end

		if propName == "_ModelPivot" and instance:IsA("Model") then
			if type(value) == "table" and #value == 3 then
				local success, err = pcall(function()
					(instance :: Model):PivotTo(CFrame.new(value[1], value[2], value[3]))
				end)
				if not success then
					Log.warn(string.format("[batchRollback] Failed to PivotTo: %s", tostring(err)))
				end
			else
				Log.warn(string.format("[batchRollback] Invalid _ModelPivot value: %s", tostring(value)))
			end
			continue
		end

		-- Generic property assignment
		local success, err = pcall(function()
			local convertedValue = PropertyConverter.convertPropertyValue(propName, value);
			(instance :: any)[propName] = convertedValue
		end)
		if not success then
			Log.warn(string.format("[batchRollback] Failed to set property %s: %s", propName, tostring(err)))
		end
	end
end

-- Helper: Apply attributes to an instance
local function applyAttributes(tree: any, instance: Instance, attributes: { [string]: any })
	for name, value in pairs(attributes) do
		if name ~= "_lemonadeUniqueId" then -- Don't modify internal attribute
			local success, err = WriteHelpers.applyAttribute(instance, name, value, tree)
			if not success then
				Log.warn(string.format("[batchRollback] Failed to set attribute %s: %s", name, tostring(err)))
			end
		end
	end
end

-- Recursively create instance tree from serialized data
local function createInstanceTree(
	tree: any,
	parent: Instance,
	data: {
		className: string,
		name: string,
		uniqueId: string?,
		properties: { [string]: any }?,
		attributes: { [string]: any }?,
		source: string?,
		children: { any }?,
	},
	preserveUniqueId: string?
): (Instance?, string?)
	-- Create the instance
	local success, instance = pcall(function()
		return Instance.new(data.className)
	end)

	if not success or not instance then
		return nil, string.format("Failed to create instance of class: %s", data.className)
	end

	instance.Name = data.name

	-- Apply properties
	if data.properties then
		applyProperties(instance, data.properties)
	end

	-- Apply attributes
	if data.attributes then
		applyAttributes(tree, instance, data.attributes)
	end

	-- Apply script source
	if data.source and instance:IsA("LuaSourceContainer") then
		pcall(function()
			(instance :: any).Source = data.source
		end)
	end

	-- Parent to Studio
	instance.Parent = parent

	-- Register with Tree
	local uniqueId: string
	if preserveUniqueId then
		uniqueId = preserveUniqueId
		instance:SetAttribute("_lemonadeUniqueId", uniqueId)
		tree:insertInstance(instance, uniqueId, {})
	else
		uniqueId = helpers.registerNewInstance(tree, instance)
	end

	-- Recursively create children
	if data.children then
		for _, childData in ipairs(data.children) do
			local childInstance, childError = createInstanceTree(tree, instance, childData, nil)
			if not childInstance then
				Log.warn("[batchRollback] Failed to create child:", childError)
			end
		end
	end

	return instance, nil
end

-- Execute delete operation
local function executeDelete(tree: any, op: DeleteOp): OperationResult
	local instance = tree:getInstance(op.uniqueId)

	if not instance then
		-- Idempotent: success even if not found
		Log.debug(string.format("[batchRollback] Delete: instance not found (idempotent success): %s", op.uniqueId))
		return {
			type = "delete",
			uniqueId = op.uniqueId,
			success = true,
		}
	end

	-- Remove from Tree before destroying
	tree:removeById(op.uniqueId)

	-- Destroy the instance
	instance:Destroy()

	Log.debug(string.format("[batchRollback] Delete: success - %s", op.path))
	return {
		type = "delete",
		uniqueId = op.uniqueId,
		success = true,
	}
end

-- Execute updateScript operation
local function executeUpdateScript(tree: any, op: UpdateScriptOp): OperationResult
	local scriptInstance = tree:getInstance(op.uniqueId)

	if not scriptInstance or not scriptInstance:IsDescendantOf(game) then
		-- Clean up stale tree entry if instance was deleted outside of agent
		if scriptInstance and not scriptInstance:IsDescendantOf(game) then
			tree:removeByInstance(scriptInstance)
		end
		return {
			type = "updateScript",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("Script not found: %s", op.uniqueId),
		}
	end

	if not scriptInstance:IsA("LuaSourceContainer") then
		return {
			type = "updateScript",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("Instance is not a script: %s", op.uniqueId),
		}
	end

	scriptInstance.Source = op.content

	Log.debug(string.format("[batchRollback] UpdateScript: success - %s", op.path))
	return {
		type = "updateScript",
		uniqueId = op.uniqueId,
		success = true,
	}
end

-- Execute createInstance operation (deserialize)
local function executeCreateInstance(tree: any, op: CreateInstanceOp): OperationResult
	local parent = tree:getInstance(op.parentUniqueId)

	if not parent then
		return {
			type = "createInstance",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("Parent not found: %s", op.parentUniqueId),
		}
	end

	-- Parse serialized data
	local success, data = pcall(function()
		return HttpService:JSONDecode(op.serialized)
	end)

	if not success then
		return {
			type = "createInstance",
			uniqueId = op.uniqueId,
			success = false,
			error = "Failed to parse serialized data",
		}
	end

	-- Override source if provided separately
	if op.source then
		data.source = op.source
	end

	-- Create instance tree with preserved uniqueId
	local instance, err = createInstanceTree(tree, parent, data, op.uniqueId)

	if not instance then
		return {
			type = "createInstance",
			uniqueId = op.uniqueId,
			success = false,
			error = err or "Failed to create instance",
		}
	end

	Log.debug(string.format("[batchRollback] CreateInstance: success - %s", op.path))
	return {
		type = "createInstance",
		uniqueId = op.uniqueId,
		success = true,
	}
end

-- Execute move operation
local function executeMove(tree: any, op: MoveOp): OperationResult
	local instance = tree:getInstance(op.uniqueId)

	if not instance then
		return {
			type = "move",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("Instance not found: %s", op.uniqueId),
		}
	end

	local newParent = tree:getInstance(op.newParentUniqueId)

	if not newParent then
		return {
			type = "move",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("New parent not found: %s", op.newParentUniqueId),
		}
	end

	-- Rename
	instance.Name = op.newName

	-- Move to new parent
	instance.Parent = newParent

	Log.debug(string.format("[batchRollback] Move: success - to %s", op.originalPath))
	return {
		type = "move",
		uniqueId = op.uniqueId,
		success = true,
	}
end

-- Execute updateInstance operation
local function executeUpdateInstance(tree: any, op: UpdateInstanceOp): OperationResult
	local instance = tree:getInstance(op.uniqueId)

	if not instance then
		return {
			type = "updateInstance",
			uniqueId = op.uniqueId,
			success = false,
			error = string.format("Instance not found: %s", op.uniqueId),
		}
	end

	-- Apply properties
	if op.properties then
		applyProperties(instance, op.properties)
	end

	-- Apply attributes
	if op.attributes then
		applyAttributes(tree, instance, op.attributes)
	end

	Log.debug(string.format("[batchRollback] UpdateInstance: success - %s", op.path))
	return {
		type = "updateInstance",
		uniqueId = op.uniqueId,
		success = true,
	}
end

-- Main handler
return function(
	self,
	params: {
		operations: { any },
		messageId: string,
	}
): {
	status: string,
	operationsExecuted: number?,
	operationsFailed: number?,
	results: { OperationResult }?,
	duration: number?,
	error: string?,
}
	local startTime = os.clock()

	Log.info(
		string.format(
			"[batchRollback] BEGIN - Processing %d operations for message %s",
			#params.operations,
			params.messageId
		)
	)

	local results: { OperationResult } = {}
	local executed = 0
	local failed = 0

	-- Process each operation in order
	for i, op in ipairs(params.operations) do
		local result: OperationResult

		local success, err = pcall(function()
			if op.type == "delete" then
				result = executeDelete(self.tree, op)
			elseif op.type == "updateScript" then
				result = executeUpdateScript(self.tree, op)
			elseif op.type == "createInstance" then
				result = executeCreateInstance(self.tree, op)
			elseif op.type == "move" then
				result = executeMove(self.tree, op)
			elseif op.type == "updateInstance" then
				result = executeUpdateInstance(self.tree, op)
			else
				result = {
					type = op.type or "unknown",
					uniqueId = op.uniqueId or "unknown",
					success = false,
					error = string.format("Unknown operation type: %s", tostring(op.type)),
				}
			end
		end)

		if not success then
			result = {
				type = op.type or "unknown",
				uniqueId = op.uniqueId or "unknown",
				success = false,
				error = tostring(err),
			}
		end

		table.insert(results, result)

		if result.success then
			executed = executed + 1
		else
			failed = failed + 1
			Log.warn(
				string.format(
					"[batchRollback] Operation %d failed: %s - %s",
					i,
					result.type,
					result.error or "unknown error"
				)
			)
		end
	end

	local duration = math.floor((os.clock() - startTime) * 1000)

	Log.info(
		string.format(
			"[batchRollback] COMPLETE - %d executed, %d failed, %dms for message %s",
			executed,
			failed,
			duration,
			params.messageId
		)
	)

	return {
		status = "completed",
		operationsExecuted = executed,
		operationsFailed = failed,
		results = results,
		duration = duration,
	}
end

end)()
local fakeScript={Source='old',IsA=function(_,name)return name=='LuaSourceContainer'end,IsDescendantOf=function()return true end}
local tree={getInstance=function(_,id)if id=='script-1' then return fakeScript end end}
local r=batchRollback({tree=tree},{messageId='m',operations={
 {type='updateScript',uniqueId='script-1',content='restored',path='Script'},
 {type='unsupported',uniqueId='bad'}
}})
check('Rollback returns completed after partial failure',r.status=='completed' and r.operationsFailed==1 and fakeScript.Source=='restored','Successful earlier mutation is retained; batch is not all-or-nothing')
local callback=nil
local simulateWarning=false
local Enum={MessageType={MessageError=1,MessageWarning=2,MessageInfo=3,MessageOutput=4}}
local LogService={MessageOut={Connect=function(_,fn)callback=fn return {Disconnect=function()callback=nil end}end}}
local RunService={Run=function()if simulateWarning then callback('benign warning',Enum.MessageType.MessageWarning)end end,Stop=function()end}
local runTests=(function()
--!strict
-- runTests: Execute game simulation and capture errors
--
-- Uses RunService to start the game (like pressing Play) and LogService.MessageOut
-- to capture all errors that occur during gameplay. This catches runtime errors
-- that only happen during actual gameplay (PlayerAdded, button clicks, etc.).



-- Parse line number from error message
-- Example: "ServerScriptService.GameManager:5: attempt to index nil"
local function extractLineNumber(errorMessage: string): number?
	local lineNum = string.match(errorMessage, ":(%d+):")
	return if lineNum then tonumber(lineNum) else nil
end

-- Parse script path from error message
-- Example: "ServerScriptService.GameManager:5: attempt to index nil" -> "ServerScriptService/GameManager"
local function extractScriptPath(errorMessage: string): string?
	-- Match pattern like "ServerScriptService.GameManager" before line number
	local scriptPath = string.match(errorMessage, "([%w%.]+):%d+:")
	if scriptPath then
		-- Convert dots to slashes for hierarchical path
		return string.gsub(scriptPath, "%.", "/")
	end
	return nil
end

export type TestError = {
	scriptPath: string,
	scriptUniqueId: string,
	lineNumber: number?,
	message: string,
	stackTrace: string?,
}

return function(
	_self,
	params: { timeout: number? }
): {
	status: string,
	totalTests: number?,
	passedTests: number?,
	failedTests: number?,
	errors: { TestError }?,
	messages: { string }?,
	duration: number?,
	error: string?,
}
	local timeout = math.min(params.timeout or 10, 30) -- Cap at 30 seconds
	local errors: { TestError } = {}
	local messages: { string } = {}

	Log.info("[runTests] Starting game simulation for", timeout, "seconds...")

	-- Connect to LogService to capture errors in real-time
	-- NOTE: Do NOT call Log.* inside this callback - it causes infinite recursion
	local connection = LogService.MessageOut:Connect(function(message, messageType)
		-- Skip our own log messages to prevent recursion
		if string.find(message, "[runTests]", 1, true) then
			return
		end

		if messageType == Enum.MessageType.MessageError or messageType == Enum.MessageType.MessageWarning then
			local scriptPath = extractScriptPath(message) or "Unknown"
			local lineNumber = extractLineNumber(message)
			local scriptUniqueId = ""

			table.insert(errors, {
				scriptPath = scriptPath,
				scriptUniqueId = scriptUniqueId,
				lineNumber = lineNumber,
				message = message,
				stackTrace = debug.traceback(),
			})
		elseif messageType == Enum.MessageType.MessageInfo or messageType == Enum.MessageType.MessageOutput then
			table.insert(messages, message)
		end
	end)

	-- Start game simulation
	local startTime = os.clock()
	local success, err = pcall(function()
		RunService:Run()
	end)

	if not success then
		connection:Disconnect()
		return {
			status = "failed",
			error = string.format("Failed to start game simulation: %s", tostring(err)),
		}
	end

	Log.info("[runTests] Game simulation started, waiting", timeout, "seconds...")

	-- Wait for timeout
	task.wait(timeout)

	-- Stop simulation
	local stopSuccess, stopErr = pcall(function()
		RunService:Stop()
	end)

	if not stopSuccess then
		Log.warn("[runTests] Warning: Failed to stop game:", tostring(stopErr))
	end

	local duration = (os.clock() - startTime) * 1000 -- Convert to ms

	-- Cleanup
	connection:Disconnect()

	Log.info(
		"[runTests] Simulation complete:",
		#errors,
		"errors,",
		#messages,
		"messages,",
		string.format("%.2fms", duration)
	)

	return {
		status = "completed",
		totalTests = 1, -- Always 1 full simulation
		passedTests = if #errors == 0 then 1 else 0,
		failedTests = if #errors > 0 then 1 else 0,
		errors = errors,
		messages = messages,
		duration = duration,
	}
end

end)()
local clean=runTests({}, {timeout=0})
check('No-assertion simulation reports one passing test',clean.totalTests==1 and clean.passedTests==1,'This is a smoke check, not a gameplay correctness assertion')
simulateWarning=true
local warned=runTests({}, {timeout=0})
check('Warning-only simulation reports failing test',warned.failedTests==1 and #warned.errors==1,'Warnings are classified together with errors')
responseStatus=403;s.projectId='project-A';s.isPolling=true
HttpService.JSONDecode=function()return {message='outdated'}end
local outdatedOk=pcall(function()s:_poll()end)
check('Logging exception bypasses outdated-version stop',not outdatedOk and s.isPolling,'With throwing Log.error, execution never reaches stopPolling in the 403 branch; production logger throws when logging is enabled')
local AssetService={CreateEditableImageAsync=function()return {Size={X=1080,Y=1920},Destroy=function()end}end}
local renderer=(function()
--!strict
-- renderContentId: Render a Roblox `rbxtemp://` (or other resolvable) content ID
-- to a base64-encoded RGBA buffer using EditableImage.
--
-- Lifted from captureScreenshot.luau so both the live screenshot path and the
-- playtest frame-capture path share the same encoder. The render is identical
-- for both: ReadPixelsBuffer has a 1024-per-dimension limit, so we tile when
-- needed.


local renderContentId = {}

-- Base64 encoding (no built-in base64 in Roblox)
local b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

function renderContentId.base64encode(buf: buffer): string
	local parts = {}
	local len = buffer.len(buf)
	for i = 0, len - 1, 3 do
		local b1 = buffer.readu8(buf, i)
		local b2 = i + 1 < len and buffer.readu8(buf, i + 1) or 0
		local b3 = i + 2 < len and buffer.readu8(buf, i + 2) or 0
		local n = b1 * 65536 + b2 * 256 + b3
		parts[#parts + 1] = string.sub(b64chars, math.floor(n / 262144) % 64 + 1, math.floor(n / 262144) % 64 + 1)
		parts[#parts + 1] = string.sub(b64chars, math.floor(n / 4096) % 64 + 1, math.floor(n / 4096) % 64 + 1)
		parts[#parts + 1] = i + 1 < len
				and string.sub(b64chars, math.floor(n / 64) % 64 + 1, math.floor(n / 64) % 64 + 1)
			or "="
		parts[#parts + 1] = i + 2 < len and string.sub(b64chars, n % 64 + 1, n % 64 + 1) or "="
	end
	return table.concat(parts)
end

local TILE_MAX = 1024

export type RenderResult = {
	width: number,
	height: number,
	data: string?,
	tiles: {
		{
			x: number,
			y: number,
			width: number,
			height: number,
			data: string,
		}
	}?,
}

export type RenderBufferResult = {
	width: number,
	height: number,
	rawBuffer: buffer,
}

-- Render a content ID to a base64-encoded RGBA result.
-- Returns single-tile `{ width, height, data }` when `outW <= 1024 and outH <= 1024`,
-- otherwise tiled `{ width, height, tiles }`. Throws inside the caller's pcall on
-- EditableImage / ReadPixelsBuffer failure.
function renderContentId.render(contentId: string, maxWidth: number): RenderResult
	local srcImg = AssetService:CreateEditableImageAsync(contentId)
	local srcSize = srcImg.Size

	local outW = math.min(maxWidth, srcSize.X)
	local outH = math.floor(outW * srcSize.Y / srcSize.X)
	local scaleX = outW / srcSize.X
	local scaleY = outH / srcSize.Y

	if outW <= TILE_MAX and outH <= TILE_MAX then
		if outW == srcSize.X and outH == srcSize.Y then
			local pixels = srcImg:ReadPixelsBuffer(Vector2.new(0, 0), srcSize)
			local b64 = renderContentId.base64encode(pixels)
			srcImg:Destroy()
			return { width = outW, height = outH, data = b64 }
		end
		local thumbImg = AssetService:CreateEditableImage({ Size = Vector2.new(outW, outH) })
		thumbImg:DrawImageTransformed(Vector2.new(outW / 2, outH / 2), Vector2.new(scaleX, scaleY), 0, srcImg)
		local pixels = thumbImg:ReadPixelsBuffer(Vector2.new(0, 0), Vector2.new(outW, outH))
		local b64 = renderContentId.base64encode(pixels)
		srcImg:Destroy()
		thumbImg:Destroy()
		return { width = outW, height = outH, data = b64 }
	end

	local tilesX = math.ceil(outW / TILE_MAX)
	local tilesY = math.ceil(outH / TILE_MAX)
	local tiles = {}

	for ty = 0, tilesY - 1 do
		for tx = 0, tilesX - 1 do
			local tileX = tx * TILE_MAX
			local tileY = ty * TILE_MAX
			local tileW = math.min(TILE_MAX, outW - tileX)
			local tileH = math.min(TILE_MAX, outH - tileY)

			local tileImg = AssetService:CreateEditableImage({
				Size = Vector2.new(tileW, tileH),
			})
			local posX = (outW / 2) - tileX
			local posY = (outH / 2) - tileY
			tileImg:DrawImageTransformed(Vector2.new(posX, posY), Vector2.new(scaleX, scaleY), 0, srcImg)
			local readOk, pixels =
				pcall(tileImg.ReadPixelsBuffer, tileImg, Vector2.new(0, 0), Vector2.new(tileW, tileH))
			if not readOk or not pixels then
				tileImg:Destroy()
				srcImg:Destroy()
				error(
					string.format(
						"ReadPixelsBuffer failed for tile (%d,%d) size %dx%d: %s",
						tileX,
						tileY,
						tileW,
						tileH,
						tostring(pixels)
					)
				)
			end
			table.insert(tiles, {
				x = tileX,
				y = tileY,
				width = tileW,
				height = tileH,
				data = renderContentId.base64encode(pixels),
			})
			tileImg:Destroy()
		end
	end

	srcImg:Destroy()
	return { width = outW, height = outH, tiles = tiles }
end

-- Render a content ID to a raw RGBA `buffer` (no base64). Single-tile only:
-- the upload path emits one storageId per frame, so multi-tile (outW or outH
-- > 1024) is unsupported here and errors. Callers must keep `maxWidth` ≤ 1024.
function renderContentId.renderToBuffer(contentId: string, maxWidth: number): RenderBufferResult
	local srcImg = AssetService:CreateEditableImageAsync(contentId)
	local srcSize = srcImg.Size

	local outW = math.min(maxWidth, srcSize.X)
	local outH = math.floor(outW * srcSize.Y / srcSize.X)

	if outW > TILE_MAX or outH > TILE_MAX then
		srcImg:Destroy()
		error(
			string.format(
				"renderToBuffer: multi-tile (>%d) not supported in upload mode; got %dx%d",
				TILE_MAX,
				outW,
				outH
			)
		)
	end

	local pixels: buffer
	if outW == srcSize.X and outH == srcSize.Y then
		pixels = srcImg:ReadPixelsBuffer(Vector2.new(0, 0), srcSize)
		srcImg:Destroy()
	else
		local scaleX = outW / srcSize.X
		local scaleY = outH / srcSize.Y
		local thumbImg = AssetService:CreateEditableImage({ Size = Vector2.new(outW, outH) })
		thumbImg:DrawImageTransformed(Vector2.new(outW / 2, outH / 2), Vector2.new(scaleX, scaleY), 0, srcImg)
		pixels = thumbImg:ReadPixelsBuffer(Vector2.new(0, 0), Vector2.new(outW, outH))
		srcImg:Destroy()
		thumbImg:Destroy()
	end

	return { width = outW, height = outH, rawBuffer = pixels }
end

return renderContentId

end)()
local portraitOk,portraitError=pcall(renderer.renderToBuffer,'mock://portrait',1024)
check('Portrait frame rejected by width-only scaling',not portraitOk and string.find(tostring(portraitError),'1024x1820',1,true)~=nil,'1080x1920 with maxWidth=1024 exceeds the 1024 height limit in the direct-upload path')
print('PROBES_COMPLETE '..observed)
