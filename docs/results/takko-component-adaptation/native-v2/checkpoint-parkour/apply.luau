
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
local store=game:GetService("ServerStorage");local name="AdaptationTransfer_a9cc78f64d86411185e2ff39f3ca9327";local token="a9cc78f6-4d86-4111-85e2-ff39f3ca9327"
assert(not store:FindFirstChild(name),"Transfer scope exists")
local encoding=game:GetService("EncodingService");local http=game:GetService("HttpService")
local data=http:JSONDecode(buffer.tostring(encoding:Base64Decode(buffer.fromstring("eyJiZWZvcmUiOnsic3RhdHVzIjoiY2FwdHVyZWQiLCJmb3JtYXQiOiJyb2Jsb3gtbmF0aXZlLXJieG0tdjEiLCJlbmdpbmVWZXJzaW9uIjoiMC43MzkuMC43MzkwNjg3IiwiYmFzZTY0IjoiUEhKdllteHZlQ0dKL3cwS0dnb0FBQVFBQUFBRUFBQUFBQUFBQUFBQUFBQk5SVlJCSkFBQUFDSUFBQUFBQUFBQThCTUJBQUFBRWdBQUFFVjRjR3hwWTJsMFFYVjBiMHB2YVc1MGN3UUFBQUIwY25WbFUxTlVVa0FBQUFCZUFBQUFBQUFBQUZBQUFBQUFBZ1VBRHdJQUVQQWpMZ0FBQUVGemMybHpkR0Z1ZERvNE0yRTFObU5sT1Mxa1ltSTNMVFF6WVRjdE9UZzNZUzB5WlRsbU0yRTFNVEF4TUdWSlRsTlVHQUFBQUJZQUFBQUFBQUFBOEFjQUFBQUFCUUFBQUVSbFkyRnNBQUVBQUFBQUFBQUdTVTVUVkJnQUFBQVdBQUFBQUFBQUFQQUhBUUFBQUFVQUFBQk5iMlJsYkFBQkFBQUFBQUFBQUVsT1UxUVhBQUFBRlFBQUFBQUFBQUR3QmdJQUFBQUVBQUFBVUdGeWRBQUJBQUFBQUFBQUFrbE9VMVFaQUFBQUZ3QUFBQUFBQUFEd0NBTUFBQUFHQUFBQVUyTnlhWEIwQUFFQUFBQUFBQUFFVUZKUFVDSUFBQUFnQUFBQUFBQUFBUEFSQUFBQUFCTUFBQUJCZEhSeWFXSjFkR1Z6VTJWeWFXRnNhWHBsQVFBQUFBQlFVazlRR0FBQUFCWUFBQUFBQUFBQThBY0FBQUFBREFBQUFFRjFkRzlNYjJOaGJHbDZaUUlCVUZKUFVCOEFBQUFkQUFBQUFBQUFBUEFPQUFBQUFBd0FBQUJEWVhCaFltbHNhWFJwWlhNaEFBQUFBQUFBQUFCUVVrOVFIUUFBQUJzQUFBQUFBQUFBOEF3QUFBQUFCZ0FBQUVOdmJHOXlNd3gvQUFBQWZ3QUFBSDhBQUFCUVVrOVFId0FBQUIwQUFBQUFBQUFBOEE0QUFBQUFFd0FBQUVSbFptbHVaWE5EWVhCaFltbHNhWFJwWlhNQ0FGQlNUMUFwQUFBQUxBQUFBQUFBQUFEd0RRQUFBQUFUQUFBQVJXMXBjM05wZG1WTllYTnJRMjl1ZEdWdWRDSWNBQU1DQUZBQUFBQUFBRkJTVDFBZkFBQUFIUUFBQUFBQUFBRHdEZ0FBQUFBUUFBQUFSVzFwYzNOcGRtVlRkSEpsYm1kMGFBUi9BQUFBVUZKUFVDTUFBQUFoQUFBQUFBQUFBUEFTQUFBQUFBd0FBQUJGYldsemMybDJaVlJwYm5RTWZ3QUFBSDhBQUFCL0FBQUFVRkpQVUJNQUFBQVJBQUFBQUFBQUFQQUNBQUFBQUFRQUFBQkdZV05sRWdBQUFBRlFVazlRR3dBQUFCa0FBQUFBQUFBQThBb0FBQUFBREFBQUFFMWxkR0ZzYm1WemMwMWhjQUVBQUFBQVVGSlBVQmdBQUFBV0FBQUFBQUFBQVBBSEFBQUFBQVFBQUFCT1lXMWxBUVVBQUFCRVpXTmhiRkJTVDFBWUFBQUFGZ0FBQUFBQUFBRHdCd0FBQUFBSkFBQUFUbTl5YldGc1RXRndBUUFBQUFCUVVrOVFGd0FBQUJVQUFBQUFBQUFBOEFZQUFBQUFDQUFBQUZKdmRHRjBhVzl1QkFBQUFBQlFVazlRR3dBQUFCa0FBQUFBQUFBQThBb0FBQUFBREFBQUFGSnZkV2RvYm1WemMwMWhjQUVBQUFBQVVGSlBVQ0FBQUFBZUFBQUFBQUFBQVBBUEFBQUFBQTBBQUFCVGIzVnlZMlZCYzNObGRFbGtHd0FBQUFBQUFBQUJVRkpQVUJNQUFBQVJBQUFBQUFBQUFQQUNBQUFBQUFRQUFBQlVZV2R6SEFBQUFBQlFVazlRTEFBQUFDb0FBQUFBQUFBQThCc0FBQUFBQndBQUFGUmxlSFIxY21VQkZnQUFBSEppZUdGemMyVjBhV1E2THk4ek9UZ3hNelkyTVRCUVVrOVFHZ0FBQUJnQUFBQUFBQUFBOEFrQUFBQUFDd0FBQUZSbGVIUjFjbVZRWVdOckFRQUFBQUJRVWs5UUlnQUFBQ0FBQUFBQUFBQUE4QkVBQUFBQUV3QUFBRlJsZUhSMWNtVlFZV05yVFdWMFlXUmhkR0VCQUFBQUFGQlNUMUFiQUFBQUdRQUFBQUFBQUFEd0NnQUFBQUFNQUFBQVZISmhibk53WVhKbGJtTjVCQUFBQUFCUVVrOVFHd0FBQUJrQUFBQUFBQUFBOEFvQUFBQUFDQUFBQUZWV1QyWm1jMlYwRFFBQUFBQUFBQUFBVUZKUFVCb0FBQUFZQUFBQUFBQUFBUEFKQUFBQUFBY0FBQUJWVmxOallXeGxEWDhBQUFCL0FBQUFVRkpQVUJVQUFBQVRBQUFBQUFBQUFQQUVBQUFBQUFZQUFBQmFTVzVrWlhnREFBQUFBbEJTVDFBaUFBQUFJQUFBQUFBQUFBRHdFUUVBQUFBVEFBQUFRWFIwY21saWRYUmxjMU5sY21saGJHbDZaUUVBQUFBQVVGSlBVQjhBQUFBZEFBQUFBQUFBQVBBT0FRQUFBQXdBQUFCRFlYQmhZbWxzYVhScFpYTWhBQUFBQUFBQUFBQlFVazlRSHdBQUFCMEFBQUFBQUFBQThBNEJBQUFBRXdBQUFFUmxabWx1WlhORFlYQmhZbWxzYVhScFpYTUNBRkJTVDFBY0FBQUFHZ0FBQUFBQUFBRHdDd0VBQUFBTkFBQUFUR1YyWld4UFprUmxkR0ZwYkJJQUFBQUFVRkpQVUNjQUFBQWxBQUFBQUFBQUFQQVdBUUFBQUE4QUFBQk5iMlJsYkUxbGMyaERSbkpoYldVUUFnQUFBQUFBQUFBQUFBQUFBRkJTVDFBY0FBQUFHZ0FBQUFBQUFBRHdDd0VBQUFBTkFBQUFUVzlrWld4TlpYTm9SR0YwWVJ3QUFBQUFVRkpQVUNRQUFBQWlBQUFBQUFBQUFQQVRBUUFBQUEwQUFBQk5iMlJsYkUxbGMyaFRhWHBsRGdBQUFBQUFBQUFBQUFBQUFGQlNUMUFoQUFBQUh3QUFBQUFBQUFEd0VBRUFBQUFTQUFBQVRXOWtaV3hUZEhKbFlXMXBibWROYjJSbEVnQUFBQUJRVWs5UUd3QUFBQmtBQUFBQUFBQUE4QW9CQUFBQUJBQUFBRTVoYldVQkNBQUFBRWx0Y0c5eWRHVmtVRkpQVUI4QUFBQWRBQUFBQUFBQUFQQU9BUUFBQUJNQUFBQk9aV1ZrYzFCcGRtOTBUV2xuY21GMGFXOXVBZ0JRVWs5UUdnQUFBQmdBQUFBQUFBQUE4QWtCQUFBQUN3QUFBRkJ5YVcxaGNubFFZWEowRXdBQUFBRlFVazlRR2dBQUFCZ0FBQUFBQUFBQThBa0JBQUFBQ3dBQUFGTmpZV3hsUm1GamRHOXlCSDhBQUFCUVVrOVFGd0FBQUJVQUFBQUFBQUFBOEFZQkFBQUFDQUFBQUZOc2FXMUlZWE5vSEFBQUFBQlFVazlRSUFBQUFCNEFBQUFBQUFBQThBOEJBQUFBRFFBQUFGTnZkWEpqWlVGemMyVjBTV1FiQUFBQUFDOTJNSUJRVWs5UUV3QUFBQkVBQUFBQUFBQUE4QUlCQUFBQUJBQUFBRlJoWjNNY0FBQUFBVkJTVDFCSkFBQUFTd0FBQUFBQUFBRHdGZ0VBQUFBT0FBQUFWMjl5YkdSUWFYWnZkRVJoZEdFZUVBRHRJUzAvQUFBQUFKdVRQTDhJQURILy8zOFFBREdja3p3SUFQQUQ3Q0V0UDRBV1dtQjdtWm1hZ2hGM2lRSUJVRkpQVUJRQUFBQVNBQUFBQUFBQUFQQURBZ0FBQUFnQUFBQkJibU5vYjNKbFpBSUJVRkpQVUNJQUFBQWdBQUFBQUFBQUFQQVJBZ0FBQUJNQUFBQkJkSFJ5YVdKMWRHVnpVMlZ5YVdGc2FYcGxBUUFBQUFCUVVrOVFHd0FBQUJrQUFBQUFBQUFBOEFvQ0FBQUFEd0FBQUVGMVpHbHZRMkZ1UTI5c2JHbGtaUUlCVUZKUFVCa0FBQUFYQUFBQUFBQUFBUEFJQWdBQUFBb0FBQUJDWVdOclVHRnlZVzFCQkg0QUFBRlFVazlRR1FBQUFCY0FBQUFBQUFBQThBZ0NBQUFBQ2dBQUFFSmhZMnRRWVhKaGJVSUVmZ0FBQUZCU1QxQWFBQUFBR0FBQUFBQUFBQUR3Q1FJQUFBQUxBQUFBUW1GamExTjFjbVpoWTJVU0FBQUFBRkJTVDFBZkFBQUFIUUFBQUFBQUFBRHdEZ0lBQUFBUUFBQUFRbUZqYTFOMWNtWmhZMlZKYm5CMWRCSUFBQUFBVUZKUFVCc0FBQUFaQUFBQUFBQUFBUEFLQWdBQUFBd0FBQUJDYjNSMGIyMVFZWEpoYlVFRWZnQUFBVkJTVDFBYkFBQUFHUUFBQUFBQUFBRHdDZ0lBQUFBTUFBQUFRbTkwZEc5dFVHRnlZVzFDQkg0QUFBQlFVazlRSEFBQUFCb0FBQUFBQUFBQThBc0NBQUFBRFFBQUFFSnZkSFJ2YlZOMWNtWmhZMlVTQUFBQUFGQlNUMUFoQUFBQUh3QUFBQUFBQUFEd0VBSUFBQUFTQUFBQVFtOTBkRzl0VTNWeVptRmpaVWx1Y0hWMEVnQUFBQUJRVWs5UVBnQUFBRUFBQUFBQUFBQUE4QTBDQUFBQUJnQUFBRU5HY21GdFpSQUE3U0V0dndBQUFBQ2JrencvQ0FBeC8vOS9DQUF4bkpNOEdBRHdBZXdoTGIrQUZscGdlNW1abW9JUmQ0bFFVazlRRmdBQUFCUUFBQUFBQUFBQThBVUNBQUFBQ2dBQUFFTmhia052Ykd4cFpHVUNBVkJTVDFBVUFBQUFFZ0FBQUFBQUFBRHdBd0lBQUFBSUFBQUFRMkZ1VVhWbGNua0NBVkJTVDFBVUFBQUFFZ0FBQUFBQUFBRHdBd0lBQUFBSUFBQUFRMkZ1Vkc5MVkyZ0NBVkJTVDFBZkFBQUFIUUFBQUFBQUFBRHdEZ0lBQUFBTUFBQUFRMkZ3WVdKcGJHbDBhV1Z6SVFBQUFBQUFBQUFBVUZKUFVCWUFBQUFVQUFBQUFBQUFBUEFGQWdBQUFBb0FBQUJEWVhOMFUyaGhaRzkzQWdGUVVrOVFKQUFBQUNJQUFBQUFBQUFBOEJNQ0FBQUFEZ0FBQUVOdmJHeHBjMmx2YmtkeWIzVndBUWNBQUFCRVpXWmhkV3gwVUZKUFVCOEFBQUFkQUFBQUFBQUFBUEFPQWdBQUFCQUFBQUJEYjJ4c2FYTnBiMjVIY205MWNFbGtBd0FBQUFCUVVrOVFHUUFBQUJjQUFBQUFBQUFBOEFnQ0FBQUFDd0FBQUVOdmJHOXlNM1ZwYm5RNEdnU3Y3RkJTVDFBa0FBQUFJZ0FBQUFBQUFBRHdFd0lBQUFBWUFBQUFRM1Z6ZEc5dFVHaDVjMmxqWVd4UWNtOXdaWEowYVdWekdRSlFVazlRSHdBQUFCMEFBQUFBQUFBQThBNENBQUFBRXdBQUFFUmxabWx1WlhORFlYQmhZbWxzYVhScFpYTUNBRkJTVDFBZEFBQUFHd0FBQUFBQUFBRHdEQUlBQUFBUkFBQUFSVzVoWW14bFJteDFhV1JHYjNKalpYTUNBVkJTVDFBYUFBQUFHQUFBQUFBQUFBRHdDUUlBQUFBTEFBQUFSbkp2Ym5SUVlYSmhiVUVFZmdBQUFWQlNUMUFhQUFBQUdBQUFBQUFBQUFEd0NRSUFBQUFMQUFBQVJuSnZiblJRWVhKaGJVSUVmZ0FBQUZCU1QxQWJBQUFBR1FBQUFBQUFBQUR3Q2dJQUFBQU1BQUFBUm5KdmJuUlRkWEptWVdObEVnQUFBQUJRVWs5UUlBQUFBQjRBQUFBQUFBQUE4QThDQUFBQUVRQUFBRVp5YjI1MFUzVnlabUZqWlVsdWNIVjBFZ0FBQUFCUVVrOVFHUUFBQUJjQUFBQUFBQUFBOEFnQ0FBQUFDZ0FBQUV4bFpuUlFZWEpoYlVFRWZnQUFBVkJTVDFBWkFBQUFGd0FBQUFBQUFBRHdDQUlBQUFBS0FBQUFUR1ZtZEZCaGNtRnRRZ1IrQUFBQVVGSlBVQm9BQUFBWUFBQUFBQUFBQVBBSkFnQUFBQXNBQUFCTVpXWjBVM1Z5Wm1GalpSSUFBQUFBVUZKUFVCOEFBQUFkQUFBQUFBQUFBUEFPQWdBQUFCQUFBQUJNWldaMFUzVnlabUZqWlVsdWNIVjBFZ0FBQUFCUVVrOVFFZ0FBQUJBQUFBQUFBQUFBOEFFQ0FBQUFCZ0FBQUV4dlkydGxaQUlBVUZKUFVCUUFBQUFTQUFBQUFBQUFBUEFEQWdBQUFBZ0FBQUJOWVhOemJHVnpjd0lBVUZKUFVCY0FBQUFWQUFBQUFBQUFBUEFHQWdBQUFBZ0FBQUJOWVhSbGNtbGhiQklBQUFZQVVGSlBVQ1lBQUFBbUFBQUFBQUFBQVBFSkFnQUFBQmtBQUFCTllYUmxjbWxoYkZaaGNtbGhiblJURFFDUWFYcGxaQUVBQUFBQVVGSlBVQjBBQUFBYkFBQUFBQUFBQVBBTUFnQUFBQVFBQUFCT1lXMWxBUW9BQUFCRGFHVmphM0J2YVc1MFVGSlBVQ0lBQUFBaEFBQUFBQUFBQVBBRkFnQUFBQXNBQUFCUWFYWnZkRTltWm5ObGRCQVVBSkFBQUFBQUFBQUFBQUJRVWs5UUdnQUFBQmdBQUFBQUFBQUE4QWtDQUFBQUN3QUFBRkpsWm14bFkzUmhibU5sQkFBQUFBQlFVazlRR2dBQUFCZ0FBQUFBQUFBQThBa0NBQUFBQ3dBQUFGSnBaMmgwVUdGeVlXMUJCSDRBQUFGUVVrOVFHZ0FBQUJnQUFBQUFBQUFBOEFrQ0FBQUFDd0FBQUZKcFoyaDBVR0Z5WVcxQ0JINEFBQUJRVWs5UUd3QUFBQmtBQUFBQUFBQUE4QW9DQUFBQURBQUFBRkpwWjJoMFUzVnlabUZqWlJJQUFBQUFVRkpQVUNBQUFBQWVBQUFBQUFBQUFQQVBBZ0FBQUJFQUFBQlNhV2RvZEZOMWNtWmhZMlZKYm5CMWRCSUFBQUFBVUZKUFVCc0FBQUFaQUFBQUFBQUFBUEFLQWdBQUFBd0FBQUJTYjI5MFVISnBiM0pwZEhrREFBQUFBRkJTVDFBaUFBQUFJQUFBQUFBQUFBRHdFUUlBQUFBTEFBQUFVbTkwVm1Wc2IyTnBkSGtPQUFBQUFBQUFBQUFBQUFBQVVGSlBVQ0FBQUFBZUFBQUFBQUFBQVBBUEFnQUFBQTBBQUFCVGIzVnlZMlZCYzNObGRFbGtHd0FBQUFBQUFBQUJVRkpQVUJNQUFBQVJBQUFBQUFBQUFQQUNBZ0FBQUFRQUFBQlVZV2R6SEFBQUFBQlFVazlRR0FBQUFCWUFBQUFBQUFBQThBY0NBQUFBQ1FBQUFGUnZjRkJoY21GdFFRUitBQUFCVUZKUFVCZ0FBQUFXQUFBQUFBQUFBUEFIQWdBQUFBa0FBQUJVYjNCUVlYSmhiVUlFZmdBQUFGQlNUMUFaQUFBQUZ3QUFBQUFBQUFEd0NBSUFBQUFLQUFBQVZHOXdVM1Z5Wm1GalpSSUFBQUFBVUZKUFVCNEFBQUFjQUFBQUFBQUFBUEFOQWdBQUFBOEFBQUJVYjNCVGRYSm1ZV05sU1c1d2RYUVNBQUFBQUZCU1QxQWJBQUFBR1FBQUFBQUFBQUR3Q2dJQUFBQU1BQUFBVkhKaGJuTndZWEpsYm1ONUJBQUFBQUJRVWs5UUh3QUFBQjBBQUFBQUFBQUE4QTRDQUFBQUNBQUFBRlpsYkc5amFYUjVEZ0FBQUFBQUFBQUFBQUFBQUZCU1QxQWNBQUFBR2dBQUFBQUFBQUR3Q3dJQUFBQU5BQUFBWm05eWJVWmhZM1J2Y2xKaGR4SUFBQUFBVUZKUFVCUUFBQUFTQUFBQUFBQUFBUEFEQWdBQUFBVUFBQUJ6YUdGd1pSSUFBQUFCVUZKUFVCc0FBQUFaQUFBQUFBQUFBUEFLQWdBQUFBUUFBQUJ6YVhwbERvRUFBQUI4bVptYWdRQUFBRkJTVDFBaUFBQUFJQUFBQUFBQUFBRHdFUU1BQUFBVEFBQUFRWFIwY21saWRYUmxjMU5sY21saGJHbDZaUUVBQUFBQVVGSlBVQjhBQUFBZEFBQUFBQUFBQVBBT0F3QUFBQXdBQUFCRFlYQmhZbWxzYVhScFpYTWhBSC8vNy81d0ZnQlFVazlRSHdBQUFCMEFBQUFBQUFBQThBNERBQUFBRXdBQUFFUmxabWx1WlhORFlYQmhZbWxzYVhScFpYTUNBVkJTVDFBVUFBQUFFZ0FBQUFBQUFBRHdBd01BQUFBSUFBQUFSR2x6WVdKc1pXUUNBRkJTVDFBYkFBQUFHUUFBQUFBQUFBRHdDZ01BQUFBTUFBQUFUR2x1YTJWa1UyOTFjbU5sQVFBQUFBQlFVazlRR1FBQUFCY0FBQUFBQUFBQThBZ0RBQUFBQkFBQUFFNWhiV1VCQmdBQUFGTmpjbWx3ZEZCU1QxQVpBQUFBRndBQUFBQUFBQUR3Q0FNQUFBQUtBQUFBVW5WdVEyOXVkR1Y0ZEJJQUFBQUFVRkpQVUQ4QUFBQTlBQUFBQUFBQUFQQXVBd0FBQUFvQUFBQlRZM0pwY0hSSGRXbGtBU1lBQUFCN05ESkdSalpDUXpJdE4wVkdOQzAwUkRoQ0xUZ3lRVGd0T1VaQlJrSTVRek5ETWpVemZWQlNUMUFIQWdBQWlBTUFBQUFBQUFEeElBTUFBQUFHQUFBQVUyOTFjbU5sQVhVREFBQnNiMk5oYkNCemNHRjNiaUE5SUhOamNtbHdkQzVRWVhKbGJuUUtGZ0R3R3k1VWIzVmphR1ZrT21OdmJtNWxZM1FvWm5WdVkzUnBiMjRvYUdsMEtRb0phV1lnYUdsMElHRnVaQWdBQXpzQUN3OEE4aFE2Um1sdVpFWnBjbk4wUTJocGJHUW9Ja2gxYldGdWIybGtJaWtnZEdobGJnb0pDWWdBOFFCd2JHRjVaWElnUFNCbllXMWxMbEFPQUZKek9rZGxkQXNBMEVaeWIyMURhR0Z5WVdOMFpYS0FBQU52QUJVcFFRRGtZMmhsWTJ0d2IybHVkRVJoZEdGSkFOMVRaWEoyWlhKVGRHOXlZV2RsalFBWlF6UUFFQ0pOQUd4cFppQnViM1JPQUFPckFCc0pGd0R5Q0QwZ1NXNXpkR0Z1WTJVdWJtVjNLQ0pOYjJSbGJDSXN4QUFKZXdBQVd3QUxQZ0NNTGs1aGJXVWdQU0NHQUo4S0NRbGxibVFLQ1FuYkFBQXJJRDJhQUF6VEFKSjBiM04wY21sdVp5aFFBWUF1ZFhObGNrbGtLWDhBRGRvQUJJRUJCNWdBRGRJQTIwOWlhbVZqZEZaaGJIVmxJaXg4QUFCVkFBYzhBQVRRQUErREFBUWhDZ25TQUJNSm1RQUZ6UUUvUVdSa1l3SUJGR1B0QVFGbUFHSUpkMkZwZENnTEFBVWFBSU02VjJGcGRFWnZjbG9Dc2xSdmNuTnZJaWt1UTBaeVdRRUJTZ0lKaGdFYUxtc0JIMXVyQUFRaFhTN3hBQVJLQUpFcklGWmxZM1J2Y2pQbEFYRXdMQ0EwTENBd2pBQWhaVzdZQUFXdkFRWWZBZ0pDQUNJZ1BXQURvQW9KWlc1a0NtVnVaQ2xRVWs5UUlBQUFBQjRBQUFBQUFBQUE4QThEQUFBQURRQUFBRk52ZFhKalpVRnpjMlYwU1dRYkFBQUFBQUFBQUFGUVVrOVFFd0FBQUJFQUFBQUFBQUFBOEFJREFBQUFCQUFBQUZSaFozTWNBQUFBQUZCU1RsUVRBQUFBSlFBQUFBQUFBQUE2QUFRQUFRQkhCQUlEQVJJQVVBQUNBQUVCUlU1RUFBQUFBQUFKQUFBQUFBQUFBRHd2Y205aWJHOTRQZz09IiwiYnl0ZXMiOjU1OTYsIm5vZGVzIjpbeyJpbmRleCI6MSwicGFyZW50SW5kZXgiOjAsIm5hbWUiOiJJbXBvcnRlZCIsImNsYXNzTmFtZSI6Ik1vZGVsIn0seyJpbmRleCI6MiwicGFyZW50SW5kZXgiOjEsIm5hbWUiOiJDaGVja3BvaW50IiwiY2xhc3NOYW1lIjoiUGFydCJ9LHsiaW5kZXgiOjMsInBhcmVudEluZGV4IjoyLCJuYW1lIjoiU2NyaXB0IiwiY2xhc3NOYW1lIjoiU2NyaXB0In0seyJpbmRleCI6NCwicGFyZW50SW5kZXgiOjIsIm5hbWUiOiJEZWNhbCIsImNsYXNzTmFtZSI6IkRlY2FsIn1dLCJzb3VyY2VzIjpbeyJpbmRleCI6MywiY2xhc3NOYW1lIjoiU2NyaXB0Iiwic291cmNlIjoibG9jYWwgc3Bhd24gPSBzY3JpcHQuUGFyZW50XG5zcGF3bi5Ub3VjaGVkOmNvbm5lY3QoZnVuY3Rpb24oaGl0KVxuXHRpZiBoaXQgYW5kIGhpdC5QYXJlbnQgYW5kIGhpdC5QYXJlbnQ6RmluZEZpcnN0Q2hpbGQoXCJIdW1hbm9pZFwiKSB0aGVuXG5cdFx0bG9jYWwgcGxheWVyID0gZ2FtZS5QbGF5ZXJzOkdldFBsYXllckZyb21DaGFyYWN0ZXIoaGl0LlBhcmVudClcblx0XHRsb2NhbCBjaGVja3BvaW50RGF0YSA9IGdhbWUuU2VydmVyU3RvcmFnZTpGaW5kRmlyc3RDaGlsZChcIkNoZWNrcG9pbnREYXRhXCIpXG5cdFx0aWYgbm90IGNoZWNrcG9pbnREYXRhIHRoZW5cblx0XHRcdGNoZWNrcG9pbnREYXRhID0gSW5zdGFuY2UubmV3KFwiTW9kZWxcIiwgZ2FtZS5TZXJ2ZXJTdG9yYWdlKVxuXHRcdFx0Y2hlY2twb2ludERhdGEuTmFtZSA9IFwiQ2hlY2twb2ludERhdGFcIlxuXHRcdGVuZFxuXHRcdFxuXHRcdGxvY2FsIGNoZWNrcG9pbnQgPSBjaGVja3BvaW50RGF0YTpGaW5kRmlyc3RDaGlsZCh0b3N0cmluZyhwbGF5ZXIudXNlcklkKSlcblx0XHRpZiBub3QgY2hlY2twb2ludCB0aGVuXG5cdFx0XHRjaGVja3BvaW50ID0gSW5zdGFuY2UubmV3KFwiT2JqZWN0VmFsdWVcIiwgY2hlY2twb2ludERhdGEpXG5cdFx0XHRjaGVja3BvaW50Lk5hbWUgPSB0b3N0cmluZyhwbGF5ZXIudXNlcklkKVxuXHRcdFx0XG5cdFx0XHRwbGF5ZXIuQ2hhcmFjdGVyQWRkZWQ6Y29ubmVjdChmdW5jdGlvbihjaGFyYWN0ZXIpXG5cdFx0XHRcdHdhaXQoKVxuXHRcdFx0XHRjaGFyYWN0ZXI6V2FpdEZvckNoaWxkKFwiVG9yc29cIikuQ0ZyYW1lID0gZ2FtZS5TZXJ2ZXJTdG9yYWdlLkNoZWNrcG9pbnREYXRhW3Rvc3RyaW5nKHBsYXllci51c2VySWQpXS5WYWx1ZS5DRnJhbWUgKyBWZWN0b3IzLm5ldygwLCA0LCAwKVxuXHRcdFx0ZW5kKVxuXHRcdGVuZFxuXHRcdFxuXHRcdGNoZWNrcG9pbnQuVmFsdWUgPSBzcGF3blxuXHRlbmRcbmVuZCkiLCJzb3VyY2VCeXRlcyI6ODg1LCJkaXNhYmxlZCI6ZmFsc2UsInJ1bkNvbnRleHQiOiJFbnVtLlJ1bkNvbnRleHQuTGVnYWN5In1dLCJjb250ZW50UmVmZXJlbmNlcyI6W3siaW5kZXgiOjQsInByb3BlcnR5IjoiVGV4dHVyZSIsInZhbHVlIjoicmJ4YXNzZXRpZDovLzM5ODEzNjYxMCJ9XSwiY29uZmlndXJhdGlvblZhbHVlcyI6W10sInNvdXJjZUJ5dGVzIjo4ODUsInJvdW5kVHJpcCI6eyJwYXNzZWQiOnRydWUsImNoZWNrZWRQcm9wZXJ0aWVzIjo3MCwiY2hlY2tlZEF0dHJpYnV0ZXMiOjAsImNoZWNrZWRSZWZlcmVuY2VzIjowLCJ1bm9ic2VydmFibGVQcm9wZXJ0aWVzIjpbIk1vZGVsLk1vZGVsTWVzaENGcmFtZSIsIk1vZGVsLk1vZGVsTWVzaERhdGEiLCJNb2RlbC5Nb2RlbE1lc2hTaXplIiwiTW9kZWwuTmVlZHNQaXZvdE1pZ3JhdGlvbiIsIk1vZGVsLlNjYWxlRmFjdG9yIiwiTW9kZWwuV29ybGRQaXZvdERhdGEiLCJQYXJ0LkNvbG9yM3VpbnQ4IiwiUGFydC5NYXRlcmlhbFZhcmlhbnRTZXJpYWxpemVkIiwiUGFydC5mb3JtRmFjdG9yUmF3IiwiU2NyaXB0LlNjcmlwdEd1aWQiXSwiaWdub3JlZElkZW50aXR5UHJvcGVydGllcyI6WyJVbmlxdWVJZCIsIkhpc3RvcnlJZCJdfSwiZXhlY3V0ZWQiOmZhbHNlfSwicGxhbiI6eyJwYWNrZXRIYXNoIjoiM2M1OTc5NmE4NmUxZGY3YWM3MTdmODczNzYzZTA4MjEyYTNiNWE5OTkyZDU5YWQyYjdmNThjYjRiMTczZjUwOSIsImlucHV0SGFzaCI6ImU0N2E2ZjAzZWEzNGY1OGQyMzJhYjQ2NTYwMjBlY2Q2Y2ExMTU5ZjNiOGZiNmQzMTI3YWZiMjU5NDlmODg4MWUiLCJyZWFzb24iOiJBZGFwdCBsZWdhY3kgY2hlY2twb2ludCBzY3JpcHQgaW50byBhbiBvcmRlcmVkIHByb2dyZXNzaW9uIGNoZWNrcG9pbnQgcGFkIGNvbXBhdGlibGUgd2l0aCBSNi9SMTUgY2hhcmFjdGVycywgc2VxdWVudGlhbCBvcmRlciB2YWxpZGF0aW9uICgxIC0+IDIgLT4gMyksIHZpc3VhbCBhY3RpdmF0aW9uIGZlZWRiYWNrLCBhbmQgZmFsbCByZWNvdmVyeSBjaGVja3BvaW50IHRyYWNraW5nLiIsInJlbW92ZVN1YnRyZWVzIjpbXSwicmVwbGFjZVNvdXJjZXMiOlt7ImluZGV4IjozLCJiZWZvcmVTaGEyNTYiOiJhYjJhMDViYTI5MWE2ODNkZGRhNzBiMDZhMjZmNmZkNWExYjgwYTFhOGIyZjc3ZWEzZWJhY2NmNDg3NzY0Yjk2Iiwic291cmNlIjoibG9jYWwgUGxheWVycyA9IGdhbWU6R2V0U2VydmljZShcIlBsYXllcnNcIilcbmxvY2FsIFR3ZWVuU2VydmljZSA9IGdhbWU6R2V0U2VydmljZShcIlR3ZWVuU2VydmljZVwiKVxuXG5sb2NhbCBwYWQgPSBzY3JpcHQuUGFyZW50XG5sb2NhbCBvcmRlciA9IHBhZDpHZXRBdHRyaWJ1dGUoXCJDaGVja3BvaW50T3JkZXJcIikgb3IgMVxuXG5sb2NhbCBsaWdodCA9IHBhZDpGaW5kRmlyc3RDaGlsZFdoaWNoSXNBKFwiUG9pbnRMaWdodFwiKVxuaWYgbm90IGxpZ2h0IHRoZW5cblx0bGlnaHQgPSBJbnN0YW5jZS5uZXcoXCJQb2ludExpZ2h0XCIpXG5cdGxpZ2h0LkNvbG9yID0gQ29sb3IzLmZyb21SR0IoMCwgMjIwLCAyNTUpXG5cdGxpZ2h0LlJhbmdlID0gMTJcblx0bGlnaHQuQnJpZ2h0bmVzcyA9IDBcblx0bGlnaHQuUGFyZW50ID0gcGFkXG5lbmRcblxubG9jYWwgZnVuY3Rpb24gYWN0aXZhdGVWaXN1YWxzKClcblx0cGFkLk1hdGVyaWFsID0gRW51bS5NYXRlcmlhbC5OZW9uXG5cdHBhZC5Db2xvciA9IENvbG9yMy5mcm9tUkdCKDAsIDIyMCwgMjU1KVxuXHRcblx0bG9jYWwgdHdlZW5JbmZvID0gVHdlZW5JbmZvLm5ldygwLjQsIEVudW0uRWFzaW5nU3R5bGUuUXVhZCwgRW51bS5FYXNpbmdEaXJlY3Rpb24uT3V0KVxuXHRsb2NhbCB0d2VlbiA9IFR3ZWVuU2VydmljZTpDcmVhdGUobGlnaHQsIHR3ZWVuSW5mbywgeyBCcmlnaHRuZXNzID0gMi41LCBSYW5nZSA9IDE2IH0pXG5cdHR3ZWVuOlBsYXkoKVxuZW5kXG5cbmxvY2FsIGZ1bmN0aW9uIG9uVG91Y2hlZChoaXQpXG5cdGlmIG5vdCBoaXQgb3Igbm90IGhpdC5QYXJlbnQgdGhlbiByZXR1cm4gZW5kXG5cdGxvY2FsIGNoYXJhY3RlciA9IGhpdC5QYXJlbnRcblx0bG9jYWwgaHVtYW5vaWQgPSBjaGFyYWN0ZXI6RmluZEZpcnN0Q2hpbGRPZkNsYXNzKFwiSHVtYW5vaWRcIilcblx0aWYgbm90IGh1bWFub2lkIG9yIGh1bWFub2lkLkhlYWx0aCA8PSAwIHRoZW4gcmV0dXJuIGVuZFxuXHRcblx0bG9jYWwgcGxheWVyID0gUGxheWVyczpHZXRQbGF5ZXJGcm9tQ2hhcmFjdGVyKGNoYXJhY3Rlcilcblx0aWYgbm90IHBsYXllciB0aGVuIHJldHVybiBlbmRcblx0XG5cdGxvY2FsIGN1cnJlbnRDUCA9IHBsYXllcjpHZXRBdHRyaWJ1dGUoXCJDdXJyZW50Q2hlY2twb2ludFwiKSBvciAwXG5cdGlmIGN1cnJlbnRDUCA9PSBvcmRlciAtIDEgdGhlblxuXHRcdHBsYXllcjpTZXRBdHRyaWJ1dGUoXCJDdXJyZW50Q2hlY2twb2ludFwiLCBvcmRlcilcblx0XHRwbGF5ZXI6U2V0QXR0cmlidXRlKFwiTGFzdENoZWNrcG9pbnRQb3NpdGlvblwiLCBwYWQuUG9zaXRpb24gKyBWZWN0b3IzLm5ldygwLCAzLjUsIDApKVxuXHRcdGFjdGl2YXRlVmlzdWFscygpXG5cdFx0XG5cdFx0bG9jYWwgc291bmQgPSBwYWQ6RmluZEZpcnN0Q2hpbGRXaGljaElzQShcIlNvdW5kXCIpXG5cdFx0aWYgc291bmQgdGhlblxuXHRcdFx0c291bmQ6UGxheSgpXG5cdFx0ZW5kXG5cdGVuZFxuZW5kXG5cbnBhZC5Ub3VjaGVkOkNvbm5lY3Qob25Ub3VjaGVkKVxuIiwicmVhc29uIjoiUmVwbGFjZXMgbGVnYWN5IFNlcnZlclN0b3JhZ2Ugc3Bhd24gbG9naWMgd2l0aCBhdHRyaWJ1dGUtYmFzZWQgc2VxdWVudGlhbCBjaGVja3BvaW50IHZhbGlkYXRpb24sIFI2L1IxNSBzdXBwb3J0LCBhbmQgZHluYW1pYyBQb2ludExpZ2h0IGFjdGl2YXRpb24gZmVlZGJhY2suIn1dLCJwcmVzZXJ2ZWRCZWhhdmlvciI6WyJSZXRhaW5zIGNoZWNrcG9pbnQgcGFkIHBhcnQgZ2VvbWV0cnksIGRpbWVuc2lvbnMsIGFuZCBzdXJmYWNlIGRlY2FsIHRleHR1cmUuIiwiUmV0YWlucyB0b3VjaCBkZXRlY3Rpb24gd2hlbiBwbGF5ZXIgY2hhcmFjdGVyIHN0ZXBzIG9udG8gdGhlIHBhZCBwbGF0Zm9ybS4iXSwicmVtYWluaW5nSW50ZWdyYXRpb24iOlsiTWFya2V0cGxhY2UgYXVkaW8gYXNzZXQgZm9yIGNoZWNrcG9pbnQgYWN0aXZhdGlvbiBjaGltZSBtdXN0IGJlIGFjcXVpcmVkIGFuZCBhdHRhY2hlZCBhcyBhIFNvdW5kIGNoaWxkIG9mIHRoZSBDaGVja3BvaW50IHBhZC4iLCJDZW50cmFsIGNvdXJzZSBtYW5hZ2VyIG11c3QgZHVwbGljYXRlIGFuZCBjb25maWd1cmUgdGhyZWUgaW5zdGFuY2VzIG9mIHRoZSBwYWQgd2l0aCBDaGVja3BvaW50T3JkZXIgYXR0cmlidXRlcyAxLCAyLCBhbmQgMyBhbG9uZyB0aGUgY291cnNlIHBhdGguIiwiRmFsbCBoYXphcmQgcGxhbmUgYW5kIEhVRCB0aW1lciBjb250cm9sbGVycyBuZWVkIGludGVncmF0aW9uIHdpdGggcGxheWVyIGF0dHJpYnV0ZXMgQ3VycmVudENoZWNrcG9pbnQgYW5kIExhc3RDaGVja3BvaW50UG9zaXRpb24uIl0sIm5hdGl2ZVRlc3RQbGFuIjpbIlN0ZXAgb250byBDaGVja3BvaW50IDIgb3IgMyBiZWZvcmUgQ2hlY2twb2ludCAxIGFuZCB2ZXJpZnkgdGhhdCBubyBhY3RpdmF0aW9uIGxpZ2h0IHRyaWdnZXJzIGFuZCBDdXJyZW50Q2hlY2twb2ludCBhdHRyaWJ1dGUgcmVtYWlucyAwLiIsIlN0ZXAgb250byBDaGVja3BvaW50IDEgYW5kIHZlcmlmeSB0aGF0IHRoZSBwYWQgbWF0ZXJpYWwgdHVybnMgdG8gTmVvbiwgUG9pbnRMaWdodCBhY3RpdmF0ZXMsIGFuZCBDdXJyZW50Q2hlY2twb2ludCB1cGRhdGVzIHRvIDEuIiwiU3RlcCBvbnRvIENoZWNrcG9pbnQgMiBhbmQgdmVyaWZ5IHN1Y2Nlc3NmdWwgYWN0aXZhdGlvbiB0byAyLCB0aGVuIHN0ZXAgb250byBDaGVja3BvaW50IDMgYW5kIHZlcmlmeSBwcm9ncmVzc2lvbiB0byAzLiIsIlRyaWdnZXIgZmFsbCBoYXphcmQgYWZ0ZXIgcmVhY2hpbmcgQ2hlY2twb2ludCAyIGFuZCB2ZXJpZnkgcGxheWVyIHJlc3Bhd25zL3RlbGVwb3J0cyB0byBDaGVja3BvaW50IDIgcG9zaXRpb24gd2l0aG91dCBsb3NpbmcgcHJvZ3Jlc3MuIl0sInJ1bnRpbWVWZXJpZmljYXRpb24iOiJub3RfcGVyZm9ybWVkIn19"))))

local function captureComponentArchive(root)
  local clones={}
  local captured=nil
  local stage="inventory"
  local ok,result=pcall(function()
    assert(not game:GetService("RunService"):IsRunning(),"Component capture requires Edit")
    local LIMIT_NODES=3000
    local LIMIT_SCRIPTS=1000
    local LIMIT_SOURCE=524288
    local LIMIT_BINARY=4194304
    local originalParent=root.Parent
    local items,indices,nodes,sources,contentReferences,configurationValues={},{},{},{},{},{}
    local configurationClasses={["NumberPose"]="number",["NumberValue"]="number",["IntValue"]="number",["DoubleConstrainedValue"]="number",["IntConstrainedValue"]="number",["StringValue"]="string",["BoolValue"]="boolean"}
    local contentProperties={["Sound"]={"SoundId"},["Animation"]={"AnimationId"},["MeshPart"]={"MeshId","TextureID"},["SpecialMesh"]={"MeshId","TextureId"},["Decal"]={"Texture"},["Texture"]={"Texture"},["SurfaceAppearance"]={"ColorMap","MetalnessMap","NormalMap","RoughnessMap"},["ParticleEmitter"]={"Texture"},["Beam"]={"Texture"},["Trail"]={"Texture"},["ImageLabel"]={"Image"},["ImageButton"]={"Image","HoverImage","PressedImage"},["VideoFrame"]={"Video"}}
    local sourceBytes=0
    local function walk(item,parentIndex,depth)
      assert(depth<=64,"Component hierarchy exceeds depth bound")
      assert(#items<LIMIT_NODES,"Component exceeds instance bound")
      assert(item.Archivable,"Nonarchivable instance cannot be preserved")
      assert(#item.Name<=1024,"Component instance name exceeds bound")
      local index=#items+1;items[index]=item;indices[item]=index
      table.insert(nodes,{index=index,parentIndex=parentIndex,name=item.Name,className=item.ClassName})
      local valueType=configurationClasses[item.ClassName]
      if valueType then
        local value=item.Value
        assert(type(value)==valueType,"Configuration value type mismatch")
        if valueType=="string" then assert(#value<=4096,"Configuration string exceeds bound") end
        if valueType=="number" then assert(value==value and math.abs(value)<math.huge,"Configuration number must be finite") end
        table.insert(configurationValues,{index=index,property="Value",value=value})
      end
      for _,property in contentProperties[item.ClassName] or {} do
        local value=item[property]
        assert(type(value)=="string" and #value<=4096,"Content reference unreadable or exceeds bound")
        table.insert(contentReferences,{index=index,property=property,value=value})
      end
      if item:IsA("LuaSourceContainer") then
        assert(#sources<LIMIT_SCRIPTS,"Component exceeds script bound")
        local source=game:GetService("ScriptEditorService"):GetEditorSource(item)
        assert(source==item.Source,"Unsaved editor source differs from serialized source")
        sourceBytes+=#source;assert(sourceBytes<=LIMIT_SOURCE,"Component exceeds source byte bound")
        local row={index=index,className=item.ClassName,source=source,sourceBytes=#source}
        if item:IsA("BaseScript") then row.disabled=item.Disabled;row.runContext=tostring(item.RunContext) end
        table.insert(sources,row)
      end
      for _,child in item:GetChildren() do walk(child,index,depth+1) end
    end
    walk(root,0,0)
    stage="serialize"
    local bytes=game:GetService("SerializationService"):SerializeInstancesAsync({root})
    assert(buffer.len(bytes)>0 and buffer.len(bytes)<=LIMIT_BINARY,"Component archive exceeds binary bound")
    captured={status="captured",format="roblox-native-rbxm-v1",engineVersion=version(),bytes=buffer.len(bytes),
      base64=buffer.tostring(game:GetService("EncodingService"):Base64Encode(bytes)),nodes=nodes,sources=sources,contentReferences=contentReferences,configurationValues=configurationValues,sourceBytes=sourceBytes,executed=false}
    stage="deserialize"
    clones=game:GetService("SerializationService"):DeserializeInstancesAsync(bytes)
    stage="compare"
    assert(#clones==1 and clones[1].Parent==nil,"Component round trip changed its root count")
    local copies,copyIndices={},{}
    local function collect(item)
      copies[#copies+1]=item;copyIndices[item]=#copies
      assert(#copies<=LIMIT_NODES,"Round-trip instance count exceeds bound")
      for _,child in item:GetChildren() do collect(child) end
    end
    collect(clones[1]);assert(#copies==#items,"Component round trip lost instances")
    for _,ref in configurationValues do
      assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture")
      assert(copies[ref.index].Value==ref.value,"Component round trip changed configuration value")
    end
    for _,ref in contentReferences do
      assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture")
      assert(copies[ref.index][ref.property]==ref.value,"Component round trip changed content reference")
    end
    local checkedProperties,checkedAttributes,checkedReferences=0,0,0
    local unobservable,missingSet={},{}
    local ignored={UniqueId=true,HistoryId=true}
    local propertyCache={}
    local function equal(a,b)
      local kind=typeof(a);if kind~=typeof(b) then return false end
      if kind=="Instance" then
        checkedReferences+=1
        assert(indices[a]~=nil,"Component has an external instance reference")
        return indices[a]==copyIndices[b]
      elseif kind=="NumberSequence" or kind=="ColorSequence" then
        return equal(a.Keypoints,b.Keypoints)
      elseif kind=="NumberSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value and a.Envelope==b.Envelope
      elseif kind=="ColorSequenceKeypoint" then
        return a.Time==b.Time and a.Value==b.Value
      elseif kind=="table" then
        for k,v in a do if not equal(v,b[k]) then return false end end
        for k in b do if a[k]==nil then return false end end
        return true
      end
      return a==b
    end
    for index,item in items do
      local copy=copies[index]
      assert(item.Name==nodes[index].name and item.ClassName==nodes[index].className and (indices[item.Parent] or 0)==nodes[index].parentIndex,"Component inventory changed during capture")
      assert(item.Name==copy.Name and item.ClassName==copy.ClassName,"Component round trip changed child identity/order")
      assert((indices[item.Parent] or 0)==(copyIndices[copy.Parent] or 0),"Component round trip changed parentage")
      -- Security controls must survive even if reflection does not label them
      -- Serialized. A faithfully restored source with a lost sandbox is unsafe.
      assert(item.Sandboxed==copy.Sandboxed,"Component round trip changed sandboxing")
      assert(item.Capabilities==copy.Capabilities,"Component round trip changed capabilities")
      local attributes=item:GetAttributes()
      assert(equal(attributes,copy:GetAttributes()),"Component round trip changed attributes")
      for _ in attributes do checkedAttributes+=1 end
      local tags=item:GetTags();local copyTags=copy:GetTags();table.sort(tags);table.sort(copyTags)
      assert(equal(tags,copyTags),"Component round trip changed tags")
      if item:IsA("LuaSourceContainer") then assert(item.Source==copy.Source,"Component round trip changed script bytes") end
      if not propertyCache[item.ClassName] then
        propertyCache[item.ClassName]=game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
      end
      for _,property in propertyCache[item.ClassName] do
        local name=property.Name
        if property.Serialized and name~="Parent" and not ignored[name] then
          local read,a=pcall(function() return item[name] end)
          local readCopy,b=pcall(function() return copy[name] end)
          if read and readCopy then
            assert(equal(a,b),"Component round trip changed property "..item.ClassName.."."..name)
            checkedProperties+=1
          else
            local key=item.ClassName.."."..name
            if not missingSet[key] then
              assert(#unobservable<3000,"Unobservable property inventory exceeds bound")
              missingSet[key]=true;table.insert(unobservable,key)
            end
          end
        end
      end
    end
    -- Serialization APIs yield. A concurrent edit must not produce evidence for stale bytes.
    assert(not game:GetService("RunService"):IsRunning(),"Studio entered Play during component capture")
    assert(root.Parent==originalParent,"Component moved during capture")
    for _,source in sources do assert(items[source.index].Source==source.source,"Component source changed during capture") end
    for _,ref in contentReferences do assert(items[ref.index][ref.property]==ref.value,"Component content reference changed during capture") end
    for _,ref in configurationValues do assert(items[ref.index].Value==ref.value,"Component configuration value changed during capture") end
    local finalItems={root};for _,x in root:GetDescendants() do table.insert(finalItems,x) end
    assert(#finalItems==#items,"Component changed during capture")
    for _,x in finalItems do assert(indices[x],"Component identity changed during capture") end
    table.sort(unobservable)
    captured.roundTrip={passed=true,checkedProperties=checkedProperties,checkedAttributes=checkedAttributes,checkedReferences=checkedReferences,
        unobservableProperties=unobservable,ignoredIdentityProperties={"UniqueId","HistoryId"}}
    return captured
  end)
  for _,copy in clones do copy:Destroy() end
  if not ok then
    if captured then captured.roundTrip={passed=false,stage=stage,reason=tostring(result):sub(1,1900)};return captured end
    return {status="unavailable",reason=stage..": "..tostring(result):sub(1,1800)}
  end
  return result
end


local function adaptComponent(root, before, plan)
 assert(not game:GetService("RunService"):IsRunning() and root.Parent==nil,"Adaptation requires unparented Edit component")
 local items,indices={},{}
 local function walk(item,parent)
  local index=#items+1;local node=assert(before.nodes[index],"Unexpected instance")
  assert(node.index==index and node.parentIndex==parent and node.name==item.Name and node.className==item.ClassName,"Adaptation input hierarchy changed")
  items[index]=item;indices[item]=index
  for _,child in item:GetChildren() do walk(child,index) end
 end
 walk(root,0);assert(#items==#before.nodes,"Adaptation input instance missing")
 for _,source in before.sources do
  local item=items[source.index]
  assert(item.Source==source.source and game:GetService("ScriptEditorService"):GetEditorSource(item)==source.source,"Adaptation input source changed")
  if item:IsA("BaseScript") then assert(item.Disabled==source.disabled and tostring(item.RunContext)==source.runContext,"Adaptation input execution setting changed") end
 end
 for _,ref in before.contentReferences or {} do assert(items[ref.index][ref.property]==ref.value,"Adaptation input media changed") end
 for _,ref in before.configurationValues or {} do assert(items[ref.index].Value==ref.value,"Adaptation input configuration changed") end
 local removed,edited={},{}
 local sourceEdits={}
 for _,edit in plan.replaceSources do
  for _,index in edit.indices or {edit.index} do table.insert(sourceEdits,{index=index,source=edit.source}) end
 end
 for _,edit in plan.removeSubtrees do
  assert(edit.index>1 and items[edit.index] and not removed[edit.index],"Invalid removal")
  local item=items[edit.index];removed[edit.index]=true
  for _,child in item:GetDescendants() do removed[indices[child]]=true end
 end
 for _,edit in sourceEdits do
  local item=assert(items[edit.index],"Missing source target")
  assert(item:IsA("LuaSourceContainer") and not removed[edit.index] and not edited[edit.index],"Invalid source edit")
  edited[edit.index]=edit.source
 end
 local properties,attributes,tags,security,cache={},{},{},{},{}
 for index,item in items do if not removed[index] then
  properties[index]={};attributes[index]=item:GetAttributes();tags[index]=item:GetTags();table.sort(tags[index])
  security[index]={sandboxed=item.Sandboxed,capabilities=item.Capabilities}
  cache[item.ClassName]=cache[item.ClassName] or game:GetService("ReflectionService"):GetPropertiesOfClass(item.ClassName)
  for _,prop in cache[item.ClassName] do if prop.Serialized and prop.Name~="Source" and prop.Name~="UniqueId" and prop.Name~="HistoryId" and prop.Name~="Parent" then
   local ok,v=pcall(function() return item[prop.Name] end)
   if ok then
    assert(typeof(v)~="Instance" or not removed[indices[v]],"Removal would break a retained instance reference")
    properties[index][prop.Name]={value=v}
   end
  end end
 end end
 for _,edit in plan.removeSubtrees do items[edit.index]:Destroy() end
 for index,source in edited do
  local item=items[index]
  game:GetService("ScriptEditorService"):UpdateSourceAsync(item,function(previous) assert(previous==item.Source,"Concurrent source edit");return source end)
  assert(item.Source==source and game:GetService("ScriptEditorService"):GetEditorSource(item)==source,"Source update did not persist")
 end
 local function equal(a,b)
  if typeof(a)~=typeof(b) then return false end
  if typeof(a)=="table" then for k,v in a do if not equal(v,b[k]) then return false end end;for k in b do if a[k]==nil then return false end end;return true end
  if typeof(a)=="NumberSequence" or typeof(a)=="ColorSequence" then return equal(a.Keypoints,b.Keypoints) end
  if typeof(a)=="NumberSequenceKeypoint" then return a.Time==b.Time and a.Value==b.Value and a.Envelope==b.Envelope end
  if typeof(a)=="ColorSequenceKeypoint" then return a.Time==b.Time and a.Value==b.Value end
  return a==b
 end
 for index,item in items do if not removed[index] then
  assert(item.Sandboxed==security[index].sandboxed and item.Capabilities==security[index].capabilities,"Adaptation changed security")
  assert(equal(item:GetAttributes(),attributes[index]),"Adaptation changed attributes")
  local currentTags=item:GetTags();table.sort(currentTags);assert(equal(currentTags,tags[index]),"Adaptation changed tags")
  for name,row in properties[index] do assert(equal(item[name],row.value),"Adaptation changed undeclared property "..name) end
 end end
 assert(root.Parent==nil and not game:GetService("RunService"):IsRunning(),"Adaptation context changed")
 return captureComponentArchive(root)
end

local roots={}
local ok,result=pcall(function()
 roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(data.before.base64)))
 assert(#roots==1 and roots[1].Parent==nil,"Unparented original required")
 return adaptComponent(roots[1],data.before,data.plan)
end)
for _,root in roots do root:Destroy() end
if not ok then return http:JSONEncode({ok=false,error=tostring(result),rootsDestroyed=true}) end
local json=http:JSONEncode(result);assert(#json<=8*1024*1024,"Result exceeds transfer limit")
local encoded=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
local hash=encoding:ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
local retained=Instance.new("Folder");retained.Name=name;retained:SetAttribute("TakkoTransfer",token)
for offset=0,#encoded-1,32768 do local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1);chunk.Value=string.sub(encoded,offset+1,math.min(offset+32768,#encoded));chunk.Parent=retained end
retained.Parent=store
return http:JSONEncode({ok=true,rootsDestroyed=true,transfer={encodedBytes=#encoded,jsonBytes=#json,sha256=hash,chunkSize=32768}})
