# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> configures provider keys without reflecting secrets or persisting them in browser storage
- Location: tests\browser\workflow.spec.ts:122:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel('Writing price')
    - locator resolved to <input min="0" value="0" max="1000" step="any" required="" type="number"/>
    - fill("0.2")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
      - waiting 100ms
    56 × waiting for element to be visible, enabled and editable
       - element is not visible
     - retrying fill action
       - waiting 500ms
    - waiting for element to be visible, enabled and editable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [ref=e12] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]: Workspace/Models
      - button "Back to project" [ref=e20] [cursor=pointer]
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - heading "Models" [level=1] [ref=e24]
          - paragraph [ref=e25]: Your models. Your team. Your budget.
        - button "Add model" [ref=e26] [cursor=pointer]
      - tablist "Models workspace" [ref=e29]:
        - tab "Model library 0" [selected] [ref=e30] [cursor=pointer]:
          - text: Model library
          - generic [ref=e31]: "0"
        - tab "Presets 1" [ref=e32] [cursor=pointer]:
          - text: Presets
          - generic [ref=e33]: "1"
      - generic [ref=e35]:
        - generic [ref=e36]: ✦
        - heading "Your model library starts here" [level=2] [ref=e37]
        - paragraph [ref=e38]: Add a model from any provider, then build your team in Presets.
      - generic [ref=e39]:
        - heading "Explore providers" [level=2] [ref=e40]
        - group "Provider" [ref=e41]:
          - button "OpenRouter" [pressed] [ref=e42] [cursor=pointer]
          - button "OpenAI" [ref=e45] [cursor=pointer]
          - button "Anthropic" [ref=e48] [cursor=pointer]
          - button "Google Gemini" [ref=e51] [cursor=pointer]
          - button "Other / local" [ref=e54] [cursor=pointer]
        - region "OpenRouter model catalog" [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - strong [ref=e62]: Available from OpenRouter
              - generic [ref=e63]: 446 models · choose one to add
            - button "Refresh model catalog" [ref=e64] [cursor=pointer]: Refresh
          - generic [ref=e67]:
            - generic [ref=e68]: Search provider models
            - searchbox "Search provider models" [ref=e69]
          - generic [ref=e70]:
            - 'button "PrismML: Ternary Bonsai 2 27B prism-ml/ternary-bonsai-2-27b" [ref=e71] [cursor=pointer]':
              - generic [ref=e73]:
                - strong [ref=e74]: "PrismML: Ternary Bonsai 2 27B"
                - generic [ref=e75]: prism-ml/ternary-bonsai-2-27b
            - 'button "Z.ai: GLM 5.3 FlashX z-ai/glm-5.3-flashx" [ref=e78] [cursor=pointer]':
              - generic [ref=e80]:
                - strong [ref=e81]: "Z.ai: GLM 5.3 FlashX"
                - generic [ref=e82]: z-ai/glm-5.3-flashx
            - button "Pareto unbiased/pareto" [ref=e85] [cursor=pointer]:
              - generic [ref=e87]:
                - strong [ref=e88]: Pareto
                - generic [ref=e89]: unbiased/pareto
            - 'button "DeepSeek: DeepSeek Pro Latest ~deepseek/deepseek-pro-latest" [ref=e92] [cursor=pointer]':
              - generic [ref=e94]:
                - strong [ref=e95]: "DeepSeek: DeepSeek Pro Latest"
                - generic [ref=e96]: ~deepseek/deepseek-pro-latest
            - 'button "DeepSeek: DeepSeek Flash Latest ~deepseek/deepseek-flash-latest" [ref=e99] [cursor=pointer]':
              - generic [ref=e101]:
                - strong [ref=e102]: "DeepSeek: DeepSeek Flash Latest"
                - generic [ref=e103]: ~deepseek/deepseek-flash-latest
            - 'button "Inference.net: Schematron V2 Turbo inference-net/schematron-v2-turbo" [ref=e106] [cursor=pointer]':
              - generic [ref=e108]:
                - strong [ref=e109]: "Inference.net: Schematron V2 Turbo"
                - generic [ref=e110]: inference-net/schematron-v2-turbo
            - 'button "Inference.net: Schematron V2 Small inference-net/schematron-v2-small" [ref=e113] [cursor=pointer]':
              - generic [ref=e115]:
                - strong [ref=e116]: "Inference.net: Schematron V2 Small"
                - generic [ref=e117]: inference-net/schematron-v2-small
            - 'button "OpenAI: GPT Astra Latest ~openai/gpt-astra-latest" [ref=e120] [cursor=pointer]':
              - generic [ref=e122]:
                - strong [ref=e123]: "OpenAI: GPT Astra Latest"
                - generic [ref=e124]: ~openai/gpt-astra-latest
            - 'button "OpenAI: GPT Sol Latest ~openai/gpt-sol-latest" [ref=e127] [cursor=pointer]':
              - generic [ref=e129]:
                - strong [ref=e130]: "OpenAI: GPT Sol Latest"
                - generic [ref=e131]: ~openai/gpt-sol-latest
            - 'button "OpenAI: GPT Terra Latest ~openai/gpt-terra-latest" [ref=e134] [cursor=pointer]':
              - generic [ref=e136]:
                - strong [ref=e137]: "OpenAI: GPT Terra Latest"
                - generic [ref=e138]: ~openai/gpt-terra-latest
            - 'button "OpenAI: GPT Luna Latest ~openai/gpt-luna-latest" [ref=e141] [cursor=pointer]':
              - generic [ref=e143]:
                - strong [ref=e144]: "OpenAI: GPT Luna Latest"
                - generic [ref=e145]: ~openai/gpt-luna-latest
            - 'button "Sakana: Fugu Ultra v2 sakana/fugu-ultra-v2" [ref=e148] [cursor=pointer]':
              - generic [ref=e150]:
                - strong [ref=e151]: "Sakana: Fugu Ultra v2"
                - generic [ref=e152]: sakana/fugu-ultra-v2
            - 'button "Sakana: Fugu Max sakana/fugu-max" [ref=e155] [cursor=pointer]':
              - generic [ref=e157]:
                - strong [ref=e158]: "Sakana: Fugu Max"
                - generic [ref=e159]: sakana/fugu-max
            - 'button "inclusionAI: Ling 3.0 Flash VL inclusionai/ling-3.0-flash-vl" [ref=e162] [cursor=pointer]':
              - generic [ref=e164]:
                - strong [ref=e165]: "inclusionAI: Ling 3.0 Flash VL"
                - generic [ref=e166]: inclusionai/ling-3.0-flash-vl
            - 'button "inclusionAI: Ling 3.0 Flash VL (free) inclusionai/ling-3.0-flash-vl:free" [ref=e169] [cursor=pointer]':
              - generic [ref=e171]:
                - strong [ref=e172]: "inclusionAI: Ling 3.0 Flash VL (free)"
                - generic [ref=e173]: inclusionai/ling-3.0-flash-vl:free
            - 'button "DeepSeek: DeepSeek V4.1 Flash deepseek/deepseek-v4.1-flash" [ref=e176] [cursor=pointer]':
              - generic [ref=e178]:
                - strong [ref=e179]: "DeepSeek: DeepSeek V4.1 Flash"
                - generic [ref=e180]: deepseek/deepseek-v4.1-flash
            - 'button "Inception: Mercury 2.5 inception/mercury-2.5" [ref=e183] [cursor=pointer]':
              - generic [ref=e185]:
                - strong [ref=e186]: "Inception: Mercury 2.5"
                - generic [ref=e187]: inception/mercury-2.5
            - 'button "Nex AGI: Nex-N2.5-Mini (free) nex-agi/nex-n2.5-mini:free" [ref=e190] [cursor=pointer]':
              - generic [ref=e192]:
                - strong [ref=e193]: "Nex AGI: Nex-N2.5-Mini (free)"
                - generic [ref=e194]: nex-agi/nex-n2.5-mini:free
            - 'button "Nex AGI: Nex-N2.5-Pro (free) nex-agi/nex-n2.5-pro:free" [ref=e197] [cursor=pointer]':
              - generic [ref=e199]:
                - strong [ref=e200]: "Nex AGI: Nex-N2.5-Pro (free)"
                - generic [ref=e201]: nex-agi/nex-n2.5-pro:free
            - 'button "OpenAI: GPT-6 Astra openai/gpt-6-astra" [ref=e204] [cursor=pointer]':
              - generic [ref=e206]:
                - strong [ref=e207]: "OpenAI: GPT-6 Astra"
                - generic [ref=e208]: openai/gpt-6-astra
            - 'button "OpenAI: GPT-6 Astra (batch) openai/gpt-6-astra:batch" [ref=e211] [cursor=pointer]':
              - generic [ref=e213]:
                - strong [ref=e214]: "OpenAI: GPT-6 Astra (batch)"
                - generic [ref=e215]: openai/gpt-6-astra:batch
            - 'button "OpenAI: GPT-6 Astra Pro openai/gpt-6-astra-pro" [ref=e218] [cursor=pointer]':
              - generic [ref=e220]:
                - strong [ref=e221]: "OpenAI: GPT-6 Astra Pro"
                - generic [ref=e222]: openai/gpt-6-astra-pro
            - 'button "OpenAI: GPT-6 Astra Pro (batch) openai/gpt-6-astra-pro:batch" [ref=e225] [cursor=pointer]':
              - generic [ref=e227]:
                - strong [ref=e228]: "OpenAI: GPT-6 Astra Pro (batch)"
                - generic [ref=e229]: openai/gpt-6-astra-pro:batch
            - 'button "inclusionAI: Ling 3.0 Flash Sante (free) inclusionai/ling-3.0-flash-sante:free" [ref=e232] [cursor=pointer]':
              - generic [ref=e234]:
                - strong [ref=e235]: "inclusionAI: Ling 3.0 Flash Sante (free)"
                - generic [ref=e236]: inclusionai/ling-3.0-flash-sante:free
            - 'button "Qwen: Qwen3.8 Max (0902) qwen/qwen3.8-max-0902" [ref=e239] [cursor=pointer]':
              - generic [ref=e241]:
                - strong [ref=e242]: "Qwen: Qwen3.8 Max (0902)"
                - generic [ref=e243]: qwen/qwen3.8-max-0902
            - 'button "Meta: Muse Spark 1.3 Contributor meta/muse-spark-1.3-contributor" [ref=e246] [cursor=pointer]':
              - generic [ref=e248]:
                - strong [ref=e249]: "Meta: Muse Spark 1.3 Contributor"
                - generic [ref=e250]: meta/muse-spark-1.3-contributor
            - 'button "Meta: Muse Spark 1.3 meta/muse-spark-1.3" [ref=e253] [cursor=pointer]':
              - generic [ref=e255]:
                - strong [ref=e256]: "Meta: Muse Spark 1.3"
                - generic [ref=e257]: meta/muse-spark-1.3
            - 'button "Google: Gemini 3.8 Flash google/gemini-3.8-flash" [ref=e260] [cursor=pointer]':
              - generic [ref=e262]:
                - strong [ref=e263]: "Google: Gemini 3.8 Flash"
                - generic [ref=e264]: google/gemini-3.8-flash
            - 'button "Google: Gemini 3.8 Flash (batch) google/gemini-3.8-flash:batch" [ref=e267] [cursor=pointer]':
              - generic [ref=e269]:
                - strong [ref=e270]: "Google: Gemini 3.8 Flash (batch)"
                - generic [ref=e271]: google/gemini-3.8-flash:batch
            - 'button "Anthropic: Claude Fable 5.1 anthropic/claude-fable-5.1" [ref=e274] [cursor=pointer]':
              - generic [ref=e276]:
                - strong [ref=e277]: "Anthropic: Claude Fable 5.1"
                - generic [ref=e278]: anthropic/claude-fable-5.1
            - 'button "Anthropic: Claude Fable 5.1 (batch) anthropic/claude-fable-5.1:batch" [ref=e281] [cursor=pointer]':
              - generic [ref=e283]:
                - strong [ref=e284]: "Anthropic: Claude Fable 5.1 (batch)"
                - generic [ref=e285]: anthropic/claude-fable-5.1:batch
            - 'button "IBM: Granite 4.2 8B ibm-granite/granite-4.2-8b" [ref=e288] [cursor=pointer]':
              - generic [ref=e290]:
                - strong [ref=e291]: "IBM: Granite 4.2 8B"
                - generic [ref=e292]: ibm-granite/granite-4.2-8b
            - 'button "Tencent: Hy4 preview tencent/hy4-preview" [ref=e295] [cursor=pointer]':
              - generic [ref=e297]:
                - strong [ref=e298]: "Tencent: Hy4 preview"
                - generic [ref=e299]: tencent/hy4-preview
            - 'button "inclusionAI: Ling 3.0 Flash Fin inclusionai/ling-3.0-flash-fin" [ref=e302] [cursor=pointer]':
              - generic [ref=e304]:
                - strong [ref=e305]: "inclusionAI: Ling 3.0 Flash Fin"
                - generic [ref=e306]: inclusionai/ling-3.0-flash-fin
            - 'button "inclusionAI: Ling 3.0 Flash Fin (free) inclusionai/ling-3.0-flash-fin:free" [ref=e309] [cursor=pointer]':
              - generic [ref=e311]:
                - strong [ref=e312]: "inclusionAI: Ling 3.0 Flash Fin (free)"
                - generic [ref=e313]: inclusionai/ling-3.0-flash-fin:free
            - 'button "Z.ai: GLM Flash Latest ~z-ai/glm-flash-latest" [ref=e316] [cursor=pointer]':
              - generic [ref=e318]:
                - strong [ref=e319]: "Z.ai: GLM Flash Latest"
                - generic [ref=e320]: ~z-ai/glm-flash-latest
            - 'button "Qwen: Qwen3.8 Flash qwen/qwen3.8-flash" [ref=e323] [cursor=pointer]':
              - generic [ref=e325]:
                - strong [ref=e326]: "Qwen: Qwen3.8 Flash"
                - generic [ref=e327]: qwen/qwen3.8-flash
            - 'button "Z.ai: GLM 5.3 Flash z-ai/glm-5.3-flash" [ref=e330] [cursor=pointer]':
              - generic [ref=e332]:
                - strong [ref=e333]: "Z.ai: GLM 5.3 Flash"
                - generic [ref=e334]: z-ai/glm-5.3-flash
            - 'button "Z.ai: GLM 5.3 Flash (batch) z-ai/glm-5.3-flash:batch" [ref=e337] [cursor=pointer]':
              - generic [ref=e339]:
                - strong [ref=e340]: "Z.ai: GLM 5.3 Flash (batch)"
                - generic [ref=e341]: z-ai/glm-5.3-flash:batch
            - 'button "Meta: Muse Spark 1.2 Contributor meta/muse-spark-1.2-contributor" [ref=e344] [cursor=pointer]':
              - generic [ref=e346]:
                - strong [ref=e347]: "Meta: Muse Spark 1.2 Contributor"
                - generic [ref=e348]: meta/muse-spark-1.2-contributor
          - button "Show more models (406 remaining)" [ref=e351] [cursor=pointer]
        - button "Connect OpenRouter or enter a model manually" [ref=e352] [cursor=pointer]
      - dialog "Add model" [ref=e353]:
        - generic [ref=e354]:
          - generic [ref=e355]:
            - heading "Add model" [level=2] [ref=e356]
            - paragraph [ref=e357]: Choose a provider, then a model. Save it once and use it in any preset.
          - button "Close dialog" [ref=e358] [cursor=pointer]
        - generic [ref=e361]:
          - generic [ref=e362]:
            - heading "1. Provider" [level=3] [ref=e363]
            - group "Provider" [ref=e364]:
              - button "OpenRouter" [pressed] [ref=e365] [cursor=pointer]
              - button "OpenAI" [ref=e368] [cursor=pointer]
              - button "Anthropic" [ref=e371] [cursor=pointer]
              - button "Google Gemini" [ref=e374] [cursor=pointer]
              - button "Other / local" [ref=e377] [cursor=pointer]
            - paragraph [ref=e382]: Official provider address filled in automatically.
            - generic [ref=e383]:
              - text: API key
              - textbox "API key" [ref=e384]:
                - /placeholder: Paste your provider API key
                - text: browser-test-secret
              - generic [ref=e385]: The provider uses this key for your models. It stays in server memory until Takko restarts.
            - heading "2. Model" [level=3] [ref=e386]
            - region "OpenRouter model catalog" [ref=e387]:
              - generic [ref=e388]:
                - generic [ref=e389]:
                  - strong [ref=e390]: Available from OpenRouter
                  - generic [ref=e391]: 446 models · choose one to add
                - button "Refresh model catalog" [ref=e392] [cursor=pointer]: Refresh
              - generic [ref=e395]:
                - generic [ref=e396]: Search provider models
                - searchbox "Search provider models" [ref=e397]
              - generic [ref=e398]:
                - 'button "PrismML: Ternary Bonsai 2 27B prism-ml/ternary-bonsai-2-27b" [ref=e399] [cursor=pointer]':
                  - generic [ref=e401]:
                    - strong [ref=e402]: "PrismML: Ternary Bonsai 2 27B"
                    - generic [ref=e403]: prism-ml/ternary-bonsai-2-27b
                - 'button "Z.ai: GLM 5.3 FlashX z-ai/glm-5.3-flashx" [ref=e406] [cursor=pointer]':
                  - generic [ref=e408]:
                    - strong [ref=e409]: "Z.ai: GLM 5.3 FlashX"
                    - generic [ref=e410]: z-ai/glm-5.3-flashx
                - button "Pareto unbiased/pareto" [ref=e413] [cursor=pointer]:
                  - generic [ref=e415]:
                    - strong [ref=e416]: Pareto
                    - generic [ref=e417]: unbiased/pareto
                - 'button "DeepSeek: DeepSeek Pro Latest ~deepseek/deepseek-pro-latest" [ref=e420] [cursor=pointer]':
                  - generic [ref=e422]:
                    - strong [ref=e423]: "DeepSeek: DeepSeek Pro Latest"
                    - generic [ref=e424]: ~deepseek/deepseek-pro-latest
                - 'button "DeepSeek: DeepSeek Flash Latest ~deepseek/deepseek-flash-latest" [ref=e427] [cursor=pointer]':
                  - generic [ref=e429]:
                    - strong [ref=e430]: "DeepSeek: DeepSeek Flash Latest"
                    - generic [ref=e431]: ~deepseek/deepseek-flash-latest
                - 'button "Inference.net: Schematron V2 Turbo inference-net/schematron-v2-turbo" [ref=e434] [cursor=pointer]':
                  - generic [ref=e436]:
                    - strong [ref=e437]: "Inference.net: Schematron V2 Turbo"
                    - generic [ref=e438]: inference-net/schematron-v2-turbo
                - 'button "Inference.net: Schematron V2 Small inference-net/schematron-v2-small" [ref=e441] [cursor=pointer]':
                  - generic [ref=e443]:
                    - strong [ref=e444]: "Inference.net: Schematron V2 Small"
                    - generic [ref=e445]: inference-net/schematron-v2-small
                - 'button "OpenAI: GPT Astra Latest ~openai/gpt-astra-latest" [ref=e448] [cursor=pointer]':
                  - generic [ref=e450]:
                    - strong [ref=e451]: "OpenAI: GPT Astra Latest"
                    - generic [ref=e452]: ~openai/gpt-astra-latest
                - 'button "OpenAI: GPT Sol Latest ~openai/gpt-sol-latest" [ref=e455] [cursor=pointer]':
                  - generic [ref=e457]:
                    - strong [ref=e458]: "OpenAI: GPT Sol Latest"
                    - generic [ref=e459]: ~openai/gpt-sol-latest
                - 'button "OpenAI: GPT Terra Latest ~openai/gpt-terra-latest" [ref=e462] [cursor=pointer]':
                  - generic [ref=e464]:
                    - strong [ref=e465]: "OpenAI: GPT Terra Latest"
                    - generic [ref=e466]: ~openai/gpt-terra-latest
                - 'button "OpenAI: GPT Luna Latest ~openai/gpt-luna-latest" [ref=e469] [cursor=pointer]':
                  - generic [ref=e471]:
                    - strong [ref=e472]: "OpenAI: GPT Luna Latest"
                    - generic [ref=e473]: ~openai/gpt-luna-latest
                - 'button "Sakana: Fugu Ultra v2 sakana/fugu-ultra-v2" [ref=e476] [cursor=pointer]':
                  - generic [ref=e478]:
                    - strong [ref=e479]: "Sakana: Fugu Ultra v2"
                    - generic [ref=e480]: sakana/fugu-ultra-v2
                - 'button "Sakana: Fugu Max sakana/fugu-max" [ref=e483] [cursor=pointer]':
                  - generic [ref=e485]:
                    - strong [ref=e486]: "Sakana: Fugu Max"
                    - generic [ref=e487]: sakana/fugu-max
                - 'button "inclusionAI: Ling 3.0 Flash VL inclusionai/ling-3.0-flash-vl" [ref=e490] [cursor=pointer]':
                  - generic [ref=e492]:
                    - strong [ref=e493]: "inclusionAI: Ling 3.0 Flash VL"
                    - generic [ref=e494]: inclusionai/ling-3.0-flash-vl
                - 'button "inclusionAI: Ling 3.0 Flash VL (free) inclusionai/ling-3.0-flash-vl:free" [ref=e497] [cursor=pointer]':
                  - generic [ref=e499]:
                    - strong [ref=e500]: "inclusionAI: Ling 3.0 Flash VL (free)"
                    - generic [ref=e501]: inclusionai/ling-3.0-flash-vl:free
                - 'button "DeepSeek: DeepSeek V4.1 Flash deepseek/deepseek-v4.1-flash" [ref=e504] [cursor=pointer]':
                  - generic [ref=e506]:
                    - strong [ref=e507]: "DeepSeek: DeepSeek V4.1 Flash"
                    - generic [ref=e508]: deepseek/deepseek-v4.1-flash
                - 'button "Inception: Mercury 2.5 inception/mercury-2.5" [ref=e511] [cursor=pointer]':
                  - generic [ref=e513]:
                    - strong [ref=e514]: "Inception: Mercury 2.5"
                    - generic [ref=e515]: inception/mercury-2.5
                - 'button "Nex AGI: Nex-N2.5-Mini (free) nex-agi/nex-n2.5-mini:free" [ref=e518] [cursor=pointer]':
                  - generic [ref=e520]:
                    - strong [ref=e521]: "Nex AGI: Nex-N2.5-Mini (free)"
                    - generic [ref=e522]: nex-agi/nex-n2.5-mini:free
                - 'button "Nex AGI: Nex-N2.5-Pro (free) nex-agi/nex-n2.5-pro:free" [ref=e525] [cursor=pointer]':
                  - generic [ref=e527]:
                    - strong [ref=e528]: "Nex AGI: Nex-N2.5-Pro (free)"
                    - generic [ref=e529]: nex-agi/nex-n2.5-pro:free
                - 'button "OpenAI: GPT-6 Astra openai/gpt-6-astra" [ref=e532] [cursor=pointer]':
                  - generic [ref=e534]:
                    - strong [ref=e535]: "OpenAI: GPT-6 Astra"
                    - generic [ref=e536]: openai/gpt-6-astra
                - 'button "OpenAI: GPT-6 Astra (batch) openai/gpt-6-astra:batch" [ref=e539] [cursor=pointer]':
                  - generic [ref=e541]:
                    - strong [ref=e542]: "OpenAI: GPT-6 Astra (batch)"
                    - generic [ref=e543]: openai/gpt-6-astra:batch
                - 'button "OpenAI: GPT-6 Astra Pro openai/gpt-6-astra-pro" [ref=e546] [cursor=pointer]':
                  - generic [ref=e548]:
                    - strong [ref=e549]: "OpenAI: GPT-6 Astra Pro"
                    - generic [ref=e550]: openai/gpt-6-astra-pro
                - 'button "OpenAI: GPT-6 Astra Pro (batch) openai/gpt-6-astra-pro:batch" [ref=e553] [cursor=pointer]':
                  - generic [ref=e555]:
                    - strong [ref=e556]: "OpenAI: GPT-6 Astra Pro (batch)"
                    - generic [ref=e557]: openai/gpt-6-astra-pro:batch
                - 'button "inclusionAI: Ling 3.0 Flash Sante (free) inclusionai/ling-3.0-flash-sante:free" [ref=e560] [cursor=pointer]':
                  - generic [ref=e562]:
                    - strong [ref=e563]: "inclusionAI: Ling 3.0 Flash Sante (free)"
                    - generic [ref=e564]: inclusionai/ling-3.0-flash-sante:free
                - 'button "Qwen: Qwen3.8 Max (0902) qwen/qwen3.8-max-0902" [ref=e567] [cursor=pointer]':
                  - generic [ref=e569]:
                    - strong [ref=e570]: "Qwen: Qwen3.8 Max (0902)"
                    - generic [ref=e571]: qwen/qwen3.8-max-0902
                - 'button "Meta: Muse Spark 1.3 Contributor meta/muse-spark-1.3-contributor" [ref=e574] [cursor=pointer]':
                  - generic [ref=e576]:
                    - strong [ref=e577]: "Meta: Muse Spark 1.3 Contributor"
                    - generic [ref=e578]: meta/muse-spark-1.3-contributor
                - 'button "Meta: Muse Spark 1.3 meta/muse-spark-1.3" [ref=e581] [cursor=pointer]':
                  - generic [ref=e583]:
                    - strong [ref=e584]: "Meta: Muse Spark 1.3"
                    - generic [ref=e585]: meta/muse-spark-1.3
                - 'button "Google: Gemini 3.8 Flash google/gemini-3.8-flash" [ref=e588] [cursor=pointer]':
                  - generic [ref=e590]:
                    - strong [ref=e591]: "Google: Gemini 3.8 Flash"
                    - generic [ref=e592]: google/gemini-3.8-flash
                - 'button "Google: Gemini 3.8 Flash (batch) google/gemini-3.8-flash:batch" [ref=e595] [cursor=pointer]':
                  - generic [ref=e597]:
                    - strong [ref=e598]: "Google: Gemini 3.8 Flash (batch)"
                    - generic [ref=e599]: google/gemini-3.8-flash:batch
                - 'button "Anthropic: Claude Fable 5.1 anthropic/claude-fable-5.1" [ref=e602] [cursor=pointer]':
                  - generic [ref=e604]:
                    - strong [ref=e605]: "Anthropic: Claude Fable 5.1"
                    - generic [ref=e606]: anthropic/claude-fable-5.1
                - 'button "Anthropic: Claude Fable 5.1 (batch) anthropic/claude-fable-5.1:batch" [ref=e609] [cursor=pointer]':
                  - generic [ref=e611]:
                    - strong [ref=e612]: "Anthropic: Claude Fable 5.1 (batch)"
                    - generic [ref=e613]: anthropic/claude-fable-5.1:batch
                - 'button "IBM: Granite 4.2 8B ibm-granite/granite-4.2-8b" [ref=e616] [cursor=pointer]':
                  - generic [ref=e618]:
                    - strong [ref=e619]: "IBM: Granite 4.2 8B"
                    - generic [ref=e620]: ibm-granite/granite-4.2-8b
                - 'button "Tencent: Hy4 preview tencent/hy4-preview" [ref=e623] [cursor=pointer]':
                  - generic [ref=e625]:
                    - strong [ref=e626]: "Tencent: Hy4 preview"
                    - generic [ref=e627]: tencent/hy4-preview
                - 'button "inclusionAI: Ling 3.0 Flash Fin inclusionai/ling-3.0-flash-fin" [ref=e630] [cursor=pointer]':
                  - generic [ref=e632]:
                    - strong [ref=e633]: "inclusionAI: Ling 3.0 Flash Fin"
                    - generic [ref=e634]: inclusionai/ling-3.0-flash-fin
                - 'button "inclusionAI: Ling 3.0 Flash Fin (free) inclusionai/ling-3.0-flash-fin:free" [ref=e637] [cursor=pointer]':
                  - generic [ref=e639]:
                    - strong [ref=e640]: "inclusionAI: Ling 3.0 Flash Fin (free)"
                    - generic [ref=e641]: inclusionai/ling-3.0-flash-fin:free
                - 'button "Z.ai: GLM Flash Latest ~z-ai/glm-flash-latest" [ref=e644] [cursor=pointer]':
                  - generic [ref=e646]:
                    - strong [ref=e647]: "Z.ai: GLM Flash Latest"
                    - generic [ref=e648]: ~z-ai/glm-flash-latest
                - 'button "Qwen: Qwen3.8 Flash qwen/qwen3.8-flash" [ref=e651] [cursor=pointer]':
                  - generic [ref=e653]:
                    - strong [ref=e654]: "Qwen: Qwen3.8 Flash"
                    - generic [ref=e655]: qwen/qwen3.8-flash
                - 'button "Z.ai: GLM 5.3 Flash z-ai/glm-5.3-flash" [ref=e658] [cursor=pointer]':
                  - generic [ref=e660]:
                    - strong [ref=e661]: "Z.ai: GLM 5.3 Flash"
                    - generic [ref=e662]: z-ai/glm-5.3-flash
                - 'button "Z.ai: GLM 5.3 Flash (batch) z-ai/glm-5.3-flash:batch" [ref=e665] [cursor=pointer]':
                  - generic [ref=e667]:
                    - strong [ref=e668]: "Z.ai: GLM 5.3 Flash (batch)"
                    - generic [ref=e669]: z-ai/glm-5.3-flash:batch
                - 'button "Meta: Muse Spark 1.2 Contributor meta/muse-spark-1.2-contributor" [ref=e672] [cursor=pointer]':
                  - generic [ref=e674]:
                    - strong [ref=e675]: "Meta: Muse Spark 1.2 Contributor"
                    - generic [ref=e676]: meta/muse-spark-1.2-contributor
              - button "Show more models (406 remaining)" [ref=e679] [cursor=pointer]
            - generic [ref=e680]:
              - generic [ref=e682]:
                - strong [ref=e683]: My model
                - generic [ref=e684]: test/model
              - generic [ref=e685]: Selected
            - button "Hide model details" [ref=e686] [cursor=pointer]
            - generic [ref=e687]:
              - generic [ref=e688]:
                - text: Library name
                - textbox "Library name" [ref=e689]:
                  - /placeholder: A name you'll recognize
                  - text: My model
              - generic [ref=e690]:
                - text: Model ID
                - textbox "Model ID" [ref=e691]: test/model
                - generic [ref=e692]: Filled in when you choose from the catalog.
            - group [ref=e693]:
              - generic "Usage cost · $0.10 read / $0.00 write" [ref=e694] [cursor=pointer]
            - group [ref=e695]:
              - generic "Fine-tune this model Optional · defaults work for most models" [ref=e696] [cursor=pointer]:
                - text: Fine-tune this model
                - generic [ref=e697]: Optional · defaults work for most models
              - option "Short · 4,096 tokens"
              - option "Standard · 8,192 tokens" [selected]
              - option "Long · 16,384 tokens"
              - option "Extra long · 32,768 tokens"
          - generic [ref=e698]:
            - button "Cancel" [ref=e699] [cursor=pointer]
            - button "Add to library" [ref=e700] [cursor=pointer]
```

# Test source

```ts
  45  |   await page.keyboard.press("End");
  46  |   await expect(
  47  |     page.getByRole("tab", { name: "Studio", exact: true }),
  48  |   ).toHaveAttribute("aria-selected", "true");
  49  | });
  50  | 
  51  | test("catalog search selects a model and its published rates", async ({
  52  |   page,
  53  | }) => {
  54  |   await page.request.put("/api/models", {
  55  |     data: {
  56  |       profiles: [],
  57  |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  58  |       budgetMicros: 250000,
  59  |       repairLimit: 1,
  60  |     },
  61  |   });
  62  |   await page.route("**/api/model-catalog", (r) =>
  63  |     r.fulfill({
  64  |       json: [
  65  |         {
  66  |           id: "test/economy",
  67  |           name: "Economy",
  68  |           inputRate: 0.1,
  69  |           outputRate: 0.4,
  70  |         },
  71  |         { id: "test/large", name: "Large", inputRate: 5, outputRate: 15 },
  72  |       ],
  73  |     }),
  74  |   );
  75  |   await page.goto("/#models");
  76  |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  77  |   const dialog = page.getByRole("dialog");
  78  |   await dialog.getByLabel("Search provider models").fill("economy");
  79  |   await dialog.getByRole("button", { name: /Economy.*economy/ }).click();
  80  |   await expect(dialog.getByLabel("Model ID", { exact: true })).toHaveValue(
  81  |     "test/economy",
  82  |   );
  83  |   await expect(dialog.getByLabel("Reading price")).toHaveValue("0.1");
  84  |   await expect(dialog.getByLabel("Writing price")).toHaveValue("0.4");
  85  |   expect(
  86  |     (await (await page.request.get("/api/models")).json()).profiles,
  87  |   ).toHaveLength(0);
  88  |   await dialog.getByRole("button", { name: "Add to library" }).click();
  89  |   await expect(dialog).toBeHidden();
  90  |   const saved = await (await page.request.get("/api/models")).json();
  91  |   expect(saved.profiles[0].model).toBe("test/economy");
  92  |   await page.request.delete("/api/model-profiles/" + saved.profiles[0].id);
  93  | });
  94  | 
  95  | test("welcomes multiple game ideas without generating a preset or claiming a connection", async ({
  96  |   page,
  97  | }, testInfo) => {
  98  |   await page.goto("/");
  99  |   await expect(
  100 |     page.getByRole("heading", { name: "What do you want to build?" }),
  101 |   ).toBeVisible();
  102 |   await page
  103 |     .getByLabel("Game idea")
  104 |     .fill(
  105 |       "Make a farming loop with crop growth, harvesting, selling and a shop",
  106 |     );
  107 |   await expect(page.getByLabel("Game idea")).toHaveValue(/farming/);
  108 |   await page.getByRole("button", { name: "Create project" }).click();
  109 |   await expect(page.getByLabel("Project request")).toHaveValue(/farming/);
  110 |   await page.getByRole("button", { name: "Plan this game" }).click();
  111 |   await expect(page.getByRole("alert")).toContainText("Configure");
  112 |   await page.getByRole("tab", { name: "Studio", exact: true }).click();
  113 |   await expect(page.getByText("Awaiting connection")).toBeVisible();
  114 |   await expect(
  115 |     page.getByRole("link", { name: "Download Takko.rbxmx" }),
  116 |   ).toHaveAttribute("href", "/api/studio/plugin");
  117 |   await page.screenshot({
  118 |     path: `docs/results/forge-v2-studio-${testInfo.project.name}.png`,
  119 |     fullPage: true,
  120 |   });
  121 | });
  122 | test("configures provider keys without reflecting secrets or persisting them in browser storage", async ({
  123 |   page,
  124 | }) => {
  125 |   await page.request.put("/api/models", {
  126 |     data: {
  127 |       profiles: [],
  128 |       routes: { planner: [], builder: [], reviewer: [], repair: [] },
  129 |       budgetMicros: 2e6,
  130 |       repairLimit: 1,
  131 |     },
  132 |   });
  133 |   await page.goto("/#models");
  134 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  135 |   const dialog = page.getByRole("dialog");
  136 |   await dialog
  137 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  138 |     .click();
  139 |   await dialog.getByLabel("Library name").fill("My model");
  140 |   await dialog.getByLabel("Model ID", { exact: true }).fill("test/model");
  141 |   await dialog
  142 |     .getByLabel("API key", { exact: true })
  143 |     .fill("browser-test-secret");
  144 |   await dialog.getByLabel("Reading price").fill("0.1");
> 145 |   await dialog.getByLabel("Writing price").fill("0.2");
      |                                            ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  146 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  147 |   await expect(dialog).toBeHidden();
  148 |   await page
  149 |     .getByRole("button", { name: "Edit My model", exact: true })
  150 |     .click();
  151 |   await expect(dialog.getByLabel("API key", { exact: true })).toHaveValue("");
  152 |   const settings = await (await page.request.get("/api/models")).text();
  153 |   expect(settings).not.toContain("browser-test-secret");
  154 |   expect(
  155 |     await page.evaluate(
  156 |       () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
  157 |     ),
  158 |   ).not.toContain("browser-test-secret");
  159 |   await dialog
  160 |     .getByRole("button", { name: "Remove model", exact: true })
  161 |     .click();
  162 |   await dialog.getByRole("button", { name: "Remove from library" }).click();
  163 |   await expect(dialog).toBeHidden();
  164 | });
  165 | 
  166 | test("keeps the model editor open when saving fails", async ({ page }) => {
  167 |   await page.goto("/#models");
  168 |   await page.getByRole("button", { name: "Add model", exact: true }).click();
  169 |   await page.route("**/api/model-profiles/*", (r) =>
  170 |     r.fulfill({
  171 |       status: 400,
  172 |       json: { error: "Unable to save model settings" },
  173 |     }),
  174 |   );
  175 |   const dialog = page.getByRole("dialog");
  176 |   await dialog
  177 |     .getByRole("button", { name: "Can't find it? Enter a model ID" })
  178 |     .click();
  179 |   await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
  180 |   await dialog.getByRole("button", { name: "Add to library" }).click();
  181 |   await expect(dialog).toBeVisible();
  182 |   await expect(dialog.getByRole("alert")).toContainText(
  183 |     "Unable to save model settings",
  184 |   );
  185 | });
  186 | 
  187 | test("welcome and model settings pass accessibility checks and fit the viewport", async ({
  188 |   page,
  189 | }, testInfo) => {
  190 |   await page.goto("/");
  191 |   expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  192 |   expect(
  193 |     await page.evaluate(
  194 |       () => document.documentElement.scrollWidth <= innerWidth,
  195 |     ),
  196 |   ).toBe(true);
  197 |   await page.screenshot({
  198 |     path: `docs/results/forge-v2-welcome-${testInfo.project.name}.png`,
  199 |     fullPage: true,
  200 |   });
  201 |   await page
  202 |     .locator(".topbar")
  203 |     .getByRole("button", { name: "Models", exact: true })
  204 |     .click();
  205 |   expect(
  206 |     (await new AxeBuilder({ page }).include(".settings-workspace").analyze())
  207 |       .violations,
  208 |   ).toEqual([]);
  209 | });
  210 | test("builds an approved non-combat project through a real HTTP provider adapter", async ({
  211 |   page,
  212 | }, testInfo) => {
  213 |   const transport = fakeTransport({ question: true });
  214 |   const server = createServer(async (req, res) => {
  215 |     let body = "";
  216 |     for await (const chunk of req) body += chunk;
  217 |     const response = await transport("http://fixture", {
  218 |       method: "POST",
  219 |       body,
  220 |     });
  221 |     res.writeHead(200, { "Content-Type": "application/json" });
  222 |     res.end(await response.text());
  223 |   });
  224 |   await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  225 |   const model = {
  226 |     ...profile(),
  227 |     baseUrl:
  228 |       "http://127.0.0.1:" + (server.address() as { port: number }).port + "/v1",
  229 |   };
  230 |   try {
  231 |     await page.request.put("/api/models", {
  232 |       data: {
  233 |         profiles: [model],
  234 |         routes: {
  235 |           planner: [model.id],
  236 |           builder: [model.id],
  237 |           reviewer: [model.id],
  238 |           repair: [model.id],
  239 |         },
  240 |         budgetMicros: 2e6,
  241 |         repairLimit: 1,
  242 |       },
  243 |     });
  244 |     await page.goto("/");
  245 |     await page.getByLabel("Game idea").fill("Build a farming game");
```