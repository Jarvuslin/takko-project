# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> keeps the model editor open when saving fails
- Location: tests\browser\workflow.spec.ts:166:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel('Model ID', { exact: true })

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
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: Search models
          - searchbox "Search models" [ref=e37]
        - button "Browse providers" [ref=e38] [cursor=pointer]
      - generic [ref=e42]:
        - text: ✦
        - heading "Your model library starts here" [level=2] [ref=e43]
        - paragraph [ref=e44]: Add a model from any provider, then build your team in Presets.
      - generic [ref=e45]:
        - heading "Explore providers" [level=2] [ref=e46]
        - group "Provider" [ref=e47]:
          - button "OpenRouter" [pressed] [ref=e48] [cursor=pointer]
          - button "OpenAI" [ref=e51] [cursor=pointer]
          - button "Anthropic" [ref=e54] [cursor=pointer]
          - button "Google Gemini" [ref=e57] [cursor=pointer]
          - button "Other / local" [ref=e60] [cursor=pointer]
        - region "OpenRouter model catalog" [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]:
              - strong [ref=e68]: Available from OpenRouter
              - generic [ref=e69]: 446 models · choose one to add
            - button "Refresh model catalog" [ref=e70] [cursor=pointer]: Refresh
          - generic [ref=e73]:
            - generic [ref=e74]: Search provider models
            - searchbox "Search provider models" [ref=e75]
          - generic [ref=e76]:
            - 'button "PrismML: Ternary Bonsai 2 27B prism-ml/ternary-bonsai-2-27b" [ref=e77] [cursor=pointer]':
              - generic [ref=e79]:
                - strong [ref=e80]: "PrismML: Ternary Bonsai 2 27B"
                - generic [ref=e81]: prism-ml/ternary-bonsai-2-27b
            - 'button "Z.ai: GLM 5.3 FlashX z-ai/glm-5.3-flashx" [ref=e84] [cursor=pointer]':
              - generic [ref=e86]:
                - strong [ref=e87]: "Z.ai: GLM 5.3 FlashX"
                - generic [ref=e88]: z-ai/glm-5.3-flashx
            - button "Pareto unbiased/pareto" [ref=e91] [cursor=pointer]:
              - generic [ref=e93]:
                - strong [ref=e94]: Pareto
                - generic [ref=e95]: unbiased/pareto
            - 'button "DeepSeek: DeepSeek Pro Latest ~deepseek/deepseek-pro-latest" [ref=e98] [cursor=pointer]':
              - generic [ref=e100]:
                - strong [ref=e101]: "DeepSeek: DeepSeek Pro Latest"
                - generic [ref=e102]: ~deepseek/deepseek-pro-latest
            - 'button "DeepSeek: DeepSeek Flash Latest ~deepseek/deepseek-flash-latest" [ref=e105] [cursor=pointer]':
              - generic [ref=e107]:
                - strong [ref=e108]: "DeepSeek: DeepSeek Flash Latest"
                - generic [ref=e109]: ~deepseek/deepseek-flash-latest
            - 'button "Inference.net: Schematron V2 Turbo inference-net/schematron-v2-turbo" [ref=e112] [cursor=pointer]':
              - generic [ref=e114]:
                - strong [ref=e115]: "Inference.net: Schematron V2 Turbo"
                - generic [ref=e116]: inference-net/schematron-v2-turbo
            - 'button "Inference.net: Schematron V2 Small inference-net/schematron-v2-small" [ref=e119] [cursor=pointer]':
              - generic [ref=e121]:
                - strong [ref=e122]: "Inference.net: Schematron V2 Small"
                - generic [ref=e123]: inference-net/schematron-v2-small
            - 'button "OpenAI: GPT Astra Latest ~openai/gpt-astra-latest" [ref=e126] [cursor=pointer]':
              - generic [ref=e128]:
                - strong [ref=e129]: "OpenAI: GPT Astra Latest"
                - generic [ref=e130]: ~openai/gpt-astra-latest
            - 'button "OpenAI: GPT Sol Latest ~openai/gpt-sol-latest" [ref=e133] [cursor=pointer]':
              - generic [ref=e135]:
                - strong [ref=e136]: "OpenAI: GPT Sol Latest"
                - generic [ref=e137]: ~openai/gpt-sol-latest
            - 'button "OpenAI: GPT Terra Latest ~openai/gpt-terra-latest" [ref=e140] [cursor=pointer]':
              - generic [ref=e142]:
                - strong [ref=e143]: "OpenAI: GPT Terra Latest"
                - generic [ref=e144]: ~openai/gpt-terra-latest
            - 'button "OpenAI: GPT Luna Latest ~openai/gpt-luna-latest" [ref=e147] [cursor=pointer]':
              - generic [ref=e149]:
                - strong [ref=e150]: "OpenAI: GPT Luna Latest"
                - generic [ref=e151]: ~openai/gpt-luna-latest
            - 'button "Sakana: Fugu Ultra v2 sakana/fugu-ultra-v2" [ref=e154] [cursor=pointer]':
              - generic [ref=e156]:
                - strong [ref=e157]: "Sakana: Fugu Ultra v2"
                - generic [ref=e158]: sakana/fugu-ultra-v2
            - 'button "Sakana: Fugu Max sakana/fugu-max" [ref=e161] [cursor=pointer]':
              - generic [ref=e163]:
                - strong [ref=e164]: "Sakana: Fugu Max"
                - generic [ref=e165]: sakana/fugu-max
            - 'button "inclusionAI: Ling 3.0 Flash VL inclusionai/ling-3.0-flash-vl" [ref=e168] [cursor=pointer]':
              - generic [ref=e170]:
                - strong [ref=e171]: "inclusionAI: Ling 3.0 Flash VL"
                - generic [ref=e172]: inclusionai/ling-3.0-flash-vl
            - 'button "inclusionAI: Ling 3.0 Flash VL (free) inclusionai/ling-3.0-flash-vl:free" [ref=e175] [cursor=pointer]':
              - generic [ref=e177]:
                - strong [ref=e178]: "inclusionAI: Ling 3.0 Flash VL (free)"
                - generic [ref=e179]: inclusionai/ling-3.0-flash-vl:free
            - 'button "DeepSeek: DeepSeek V4.1 Flash deepseek/deepseek-v4.1-flash" [ref=e182] [cursor=pointer]':
              - generic [ref=e184]:
                - strong [ref=e185]: "DeepSeek: DeepSeek V4.1 Flash"
                - generic [ref=e186]: deepseek/deepseek-v4.1-flash
            - 'button "Inception: Mercury 2.5 inception/mercury-2.5" [ref=e189] [cursor=pointer]':
              - generic [ref=e191]:
                - strong [ref=e192]: "Inception: Mercury 2.5"
                - generic [ref=e193]: inception/mercury-2.5
            - 'button "Nex AGI: Nex-N2.5-Mini (free) nex-agi/nex-n2.5-mini:free" [ref=e196] [cursor=pointer]':
              - generic [ref=e198]:
                - strong [ref=e199]: "Nex AGI: Nex-N2.5-Mini (free)"
                - generic [ref=e200]: nex-agi/nex-n2.5-mini:free
            - 'button "Nex AGI: Nex-N2.5-Pro (free) nex-agi/nex-n2.5-pro:free" [ref=e203] [cursor=pointer]':
              - generic [ref=e205]:
                - strong [ref=e206]: "Nex AGI: Nex-N2.5-Pro (free)"
                - generic [ref=e207]: nex-agi/nex-n2.5-pro:free
            - 'button "OpenAI: GPT-6 Astra openai/gpt-6-astra" [ref=e210] [cursor=pointer]':
              - generic [ref=e212]:
                - strong [ref=e213]: "OpenAI: GPT-6 Astra"
                - generic [ref=e214]: openai/gpt-6-astra
            - 'button "OpenAI: GPT-6 Astra (batch) openai/gpt-6-astra:batch" [ref=e217] [cursor=pointer]':
              - generic [ref=e219]:
                - strong [ref=e220]: "OpenAI: GPT-6 Astra (batch)"
                - generic [ref=e221]: openai/gpt-6-astra:batch
            - 'button "OpenAI: GPT-6 Astra Pro openai/gpt-6-astra-pro" [ref=e224] [cursor=pointer]':
              - generic [ref=e226]:
                - strong [ref=e227]: "OpenAI: GPT-6 Astra Pro"
                - generic [ref=e228]: openai/gpt-6-astra-pro
            - 'button "OpenAI: GPT-6 Astra Pro (batch) openai/gpt-6-astra-pro:batch" [ref=e231] [cursor=pointer]':
              - generic [ref=e233]:
                - strong [ref=e234]: "OpenAI: GPT-6 Astra Pro (batch)"
                - generic [ref=e235]: openai/gpt-6-astra-pro:batch
            - 'button "inclusionAI: Ling 3.0 Flash Sante (free) inclusionai/ling-3.0-flash-sante:free" [ref=e238] [cursor=pointer]':
              - generic [ref=e240]:
                - strong [ref=e241]: "inclusionAI: Ling 3.0 Flash Sante (free)"
                - generic [ref=e242]: inclusionai/ling-3.0-flash-sante:free
            - 'button "Qwen: Qwen3.8 Max (0902) qwen/qwen3.8-max-0902" [ref=e245] [cursor=pointer]':
              - generic [ref=e247]:
                - strong [ref=e248]: "Qwen: Qwen3.8 Max (0902)"
                - generic [ref=e249]: qwen/qwen3.8-max-0902
            - 'button "Meta: Muse Spark 1.3 Contributor meta/muse-spark-1.3-contributor" [ref=e252] [cursor=pointer]':
              - generic [ref=e254]:
                - strong [ref=e255]: "Meta: Muse Spark 1.3 Contributor"
                - generic [ref=e256]: meta/muse-spark-1.3-contributor
            - 'button "Meta: Muse Spark 1.3 meta/muse-spark-1.3" [ref=e259] [cursor=pointer]':
              - generic [ref=e261]:
                - strong [ref=e262]: "Meta: Muse Spark 1.3"
                - generic [ref=e263]: meta/muse-spark-1.3
            - 'button "Google: Gemini 3.8 Flash google/gemini-3.8-flash" [ref=e266] [cursor=pointer]':
              - generic [ref=e268]:
                - strong [ref=e269]: "Google: Gemini 3.8 Flash"
                - generic [ref=e270]: google/gemini-3.8-flash
            - 'button "Google: Gemini 3.8 Flash (batch) google/gemini-3.8-flash:batch" [ref=e273] [cursor=pointer]':
              - generic [ref=e275]:
                - strong [ref=e276]: "Google: Gemini 3.8 Flash (batch)"
                - generic [ref=e277]: google/gemini-3.8-flash:batch
            - 'button "Anthropic: Claude Fable 5.1 anthropic/claude-fable-5.1" [ref=e280] [cursor=pointer]':
              - generic [ref=e282]:
                - strong [ref=e283]: "Anthropic: Claude Fable 5.1"
                - generic [ref=e284]: anthropic/claude-fable-5.1
            - 'button "Anthropic: Claude Fable 5.1 (batch) anthropic/claude-fable-5.1:batch" [ref=e287] [cursor=pointer]':
              - generic [ref=e289]:
                - strong [ref=e290]: "Anthropic: Claude Fable 5.1 (batch)"
                - generic [ref=e291]: anthropic/claude-fable-5.1:batch
            - 'button "IBM: Granite 4.2 8B ibm-granite/granite-4.2-8b" [ref=e294] [cursor=pointer]':
              - generic [ref=e296]:
                - strong [ref=e297]: "IBM: Granite 4.2 8B"
                - generic [ref=e298]: ibm-granite/granite-4.2-8b
            - 'button "Tencent: Hy4 preview tencent/hy4-preview" [ref=e301] [cursor=pointer]':
              - generic [ref=e303]:
                - strong [ref=e304]: "Tencent: Hy4 preview"
                - generic [ref=e305]: tencent/hy4-preview
            - 'button "inclusionAI: Ling 3.0 Flash Fin inclusionai/ling-3.0-flash-fin" [ref=e308] [cursor=pointer]':
              - generic [ref=e310]:
                - strong [ref=e311]: "inclusionAI: Ling 3.0 Flash Fin"
                - generic [ref=e312]: inclusionai/ling-3.0-flash-fin
            - 'button "inclusionAI: Ling 3.0 Flash Fin (free) inclusionai/ling-3.0-flash-fin:free" [ref=e315] [cursor=pointer]':
              - generic [ref=e317]:
                - strong [ref=e318]: "inclusionAI: Ling 3.0 Flash Fin (free)"
                - generic [ref=e319]: inclusionai/ling-3.0-flash-fin:free
            - 'button "Z.ai: GLM Flash Latest ~z-ai/glm-flash-latest" [ref=e322] [cursor=pointer]':
              - generic [ref=e324]:
                - strong [ref=e325]: "Z.ai: GLM Flash Latest"
                - generic [ref=e326]: ~z-ai/glm-flash-latest
            - 'button "Qwen: Qwen3.8 Flash qwen/qwen3.8-flash" [ref=e329] [cursor=pointer]':
              - generic [ref=e331]:
                - strong [ref=e332]: "Qwen: Qwen3.8 Flash"
                - generic [ref=e333]: qwen/qwen3.8-flash
            - 'button "Z.ai: GLM 5.3 Flash z-ai/glm-5.3-flash" [ref=e336] [cursor=pointer]':
              - generic [ref=e338]:
                - strong [ref=e339]: "Z.ai: GLM 5.3 Flash"
                - generic [ref=e340]: z-ai/glm-5.3-flash
            - 'button "Z.ai: GLM 5.3 Flash (batch) z-ai/glm-5.3-flash:batch" [ref=e343] [cursor=pointer]':
              - generic [ref=e345]:
                - strong [ref=e346]: "Z.ai: GLM 5.3 Flash (batch)"
                - generic [ref=e347]: z-ai/glm-5.3-flash:batch
            - 'button "Meta: Muse Spark 1.2 Contributor meta/muse-spark-1.2-contributor" [ref=e350] [cursor=pointer]':
              - generic [ref=e352]:
                - strong [ref=e353]: "Meta: Muse Spark 1.2 Contributor"
                - generic [ref=e354]: meta/muse-spark-1.2-contributor
          - button "Show more models (406 remaining)" [ref=e357] [cursor=pointer]
        - button "Connect OpenRouter or enter a model manually" [ref=e358] [cursor=pointer]
      - dialog "Add model" [ref=e359]:
        - generic [ref=e360]:
          - generic [ref=e361]:
            - heading "Add model" [level=2] [ref=e362]
            - paragraph [ref=e363]: Choose a provider, then a model. Save it once and use it in any preset.
          - button "Close dialog" [ref=e364] [cursor=pointer]
        - generic [ref=e367]:
          - generic [ref=e368]:
            - heading "1. Provider" [level=3] [ref=e369]
            - group "Provider" [ref=e370]:
              - button "OpenRouter" [pressed] [ref=e371] [cursor=pointer]
              - button "OpenAI" [ref=e374] [cursor=pointer]
              - button "Anthropic" [ref=e377] [cursor=pointer]
              - button "Google Gemini" [ref=e380] [cursor=pointer]
              - button "Other / local" [ref=e383] [cursor=pointer]
            - paragraph [ref=e388]: Official endpoint connected automatically.
            - generic [ref=e389]:
              - text: API key
              - textbox "API key The provider uses this key for your models. It stays in server memory until Takko restarts." [ref=e390]:
                - /placeholder: Paste your provider API key
              - generic [ref=e391]: The provider uses this key for your models. It stays in server memory until Takko restarts.
            - heading "2. Model" [level=3] [ref=e392]
            - region "OpenRouter model catalog" [ref=e393]:
              - generic [ref=e394]:
                - generic [ref=e395]:
                  - strong [ref=e396]: Available from OpenRouter
                  - generic [ref=e397]: 446 models · choose one to add
                - button "Refresh model catalog" [ref=e398] [cursor=pointer]: Refresh
              - generic [ref=e401]:
                - generic [ref=e402]: Search provider models
                - searchbox "Search provider models" [ref=e403]
              - generic [ref=e404]:
                - 'button "PrismML: Ternary Bonsai 2 27B prism-ml/ternary-bonsai-2-27b" [ref=e405] [cursor=pointer]':
                  - generic [ref=e407]:
                    - strong [ref=e408]: "PrismML: Ternary Bonsai 2 27B"
                    - generic [ref=e409]: prism-ml/ternary-bonsai-2-27b
                - 'button "Z.ai: GLM 5.3 FlashX z-ai/glm-5.3-flashx" [ref=e412] [cursor=pointer]':
                  - generic [ref=e414]:
                    - strong [ref=e415]: "Z.ai: GLM 5.3 FlashX"
                    - generic [ref=e416]: z-ai/glm-5.3-flashx
                - button "Pareto unbiased/pareto" [ref=e419] [cursor=pointer]:
                  - generic [ref=e421]:
                    - strong [ref=e422]: Pareto
                    - generic [ref=e423]: unbiased/pareto
                - 'button "DeepSeek: DeepSeek Pro Latest ~deepseek/deepseek-pro-latest" [ref=e426] [cursor=pointer]':
                  - generic [ref=e428]:
                    - strong [ref=e429]: "DeepSeek: DeepSeek Pro Latest"
                    - generic [ref=e430]: ~deepseek/deepseek-pro-latest
                - 'button "DeepSeek: DeepSeek Flash Latest ~deepseek/deepseek-flash-latest" [ref=e433] [cursor=pointer]':
                  - generic [ref=e435]:
                    - strong [ref=e436]: "DeepSeek: DeepSeek Flash Latest"
                    - generic [ref=e437]: ~deepseek/deepseek-flash-latest
                - 'button "Inference.net: Schematron V2 Turbo inference-net/schematron-v2-turbo" [ref=e440] [cursor=pointer]':
                  - generic [ref=e442]:
                    - strong [ref=e443]: "Inference.net: Schematron V2 Turbo"
                    - generic [ref=e444]: inference-net/schematron-v2-turbo
                - 'button "Inference.net: Schematron V2 Small inference-net/schematron-v2-small" [ref=e447] [cursor=pointer]':
                  - generic [ref=e449]:
                    - strong [ref=e450]: "Inference.net: Schematron V2 Small"
                    - generic [ref=e451]: inference-net/schematron-v2-small
                - 'button "OpenAI: GPT Astra Latest ~openai/gpt-astra-latest" [ref=e454] [cursor=pointer]':
                  - generic [ref=e456]:
                    - strong [ref=e457]: "OpenAI: GPT Astra Latest"
                    - generic [ref=e458]: ~openai/gpt-astra-latest
                - 'button "OpenAI: GPT Sol Latest ~openai/gpt-sol-latest" [ref=e461] [cursor=pointer]':
                  - generic [ref=e463]:
                    - strong [ref=e464]: "OpenAI: GPT Sol Latest"
                    - generic [ref=e465]: ~openai/gpt-sol-latest
                - 'button "OpenAI: GPT Terra Latest ~openai/gpt-terra-latest" [ref=e468] [cursor=pointer]':
                  - generic [ref=e470]:
                    - strong [ref=e471]: "OpenAI: GPT Terra Latest"
                    - generic [ref=e472]: ~openai/gpt-terra-latest
                - 'button "OpenAI: GPT Luna Latest ~openai/gpt-luna-latest" [ref=e475] [cursor=pointer]':
                  - generic [ref=e477]:
                    - strong [ref=e478]: "OpenAI: GPT Luna Latest"
                    - generic [ref=e479]: ~openai/gpt-luna-latest
                - 'button "Sakana: Fugu Ultra v2 sakana/fugu-ultra-v2" [ref=e482] [cursor=pointer]':
                  - generic [ref=e484]:
                    - strong [ref=e485]: "Sakana: Fugu Ultra v2"
                    - generic [ref=e486]: sakana/fugu-ultra-v2
                - 'button "Sakana: Fugu Max sakana/fugu-max" [ref=e489] [cursor=pointer]':
                  - generic [ref=e491]:
                    - strong [ref=e492]: "Sakana: Fugu Max"
                    - generic [ref=e493]: sakana/fugu-max
                - 'button "inclusionAI: Ling 3.0 Flash VL inclusionai/ling-3.0-flash-vl" [ref=e496] [cursor=pointer]':
                  - generic [ref=e498]:
                    - strong [ref=e499]: "inclusionAI: Ling 3.0 Flash VL"
                    - generic [ref=e500]: inclusionai/ling-3.0-flash-vl
                - 'button "inclusionAI: Ling 3.0 Flash VL (free) inclusionai/ling-3.0-flash-vl:free" [ref=e503] [cursor=pointer]':
                  - generic [ref=e505]:
                    - strong [ref=e506]: "inclusionAI: Ling 3.0 Flash VL (free)"
                    - generic [ref=e507]: inclusionai/ling-3.0-flash-vl:free
                - 'button "DeepSeek: DeepSeek V4.1 Flash deepseek/deepseek-v4.1-flash" [ref=e510] [cursor=pointer]':
                  - generic [ref=e512]:
                    - strong [ref=e513]: "DeepSeek: DeepSeek V4.1 Flash"
                    - generic [ref=e514]: deepseek/deepseek-v4.1-flash
                - 'button "Inception: Mercury 2.5 inception/mercury-2.5" [ref=e517] [cursor=pointer]':
                  - generic [ref=e519]:
                    - strong [ref=e520]: "Inception: Mercury 2.5"
                    - generic [ref=e521]: inception/mercury-2.5
                - 'button "Nex AGI: Nex-N2.5-Mini (free) nex-agi/nex-n2.5-mini:free" [ref=e524] [cursor=pointer]':
                  - generic [ref=e526]:
                    - strong [ref=e527]: "Nex AGI: Nex-N2.5-Mini (free)"
                    - generic [ref=e528]: nex-agi/nex-n2.5-mini:free
                - 'button "Nex AGI: Nex-N2.5-Pro (free) nex-agi/nex-n2.5-pro:free" [ref=e531] [cursor=pointer]':
                  - generic [ref=e533]:
                    - strong [ref=e534]: "Nex AGI: Nex-N2.5-Pro (free)"
                    - generic [ref=e535]: nex-agi/nex-n2.5-pro:free
                - 'button "OpenAI: GPT-6 Astra openai/gpt-6-astra" [ref=e538] [cursor=pointer]':
                  - generic [ref=e540]:
                    - strong [ref=e541]: "OpenAI: GPT-6 Astra"
                    - generic [ref=e542]: openai/gpt-6-astra
                - 'button "OpenAI: GPT-6 Astra (batch) openai/gpt-6-astra:batch" [ref=e545] [cursor=pointer]':
                  - generic [ref=e547]:
                    - strong [ref=e548]: "OpenAI: GPT-6 Astra (batch)"
                    - generic [ref=e549]: openai/gpt-6-astra:batch
                - 'button "OpenAI: GPT-6 Astra Pro openai/gpt-6-astra-pro" [ref=e552] [cursor=pointer]':
                  - generic [ref=e554]:
                    - strong [ref=e555]: "OpenAI: GPT-6 Astra Pro"
                    - generic [ref=e556]: openai/gpt-6-astra-pro
                - 'button "OpenAI: GPT-6 Astra Pro (batch) openai/gpt-6-astra-pro:batch" [ref=e559] [cursor=pointer]':
                  - generic [ref=e561]:
                    - strong [ref=e562]: "OpenAI: GPT-6 Astra Pro (batch)"
                    - generic [ref=e563]: openai/gpt-6-astra-pro:batch
                - 'button "inclusionAI: Ling 3.0 Flash Sante (free) inclusionai/ling-3.0-flash-sante:free" [ref=e566] [cursor=pointer]':
                  - generic [ref=e568]:
                    - strong [ref=e569]: "inclusionAI: Ling 3.0 Flash Sante (free)"
                    - generic [ref=e570]: inclusionai/ling-3.0-flash-sante:free
                - 'button "Qwen: Qwen3.8 Max (0902) qwen/qwen3.8-max-0902" [ref=e573] [cursor=pointer]':
                  - generic [ref=e575]:
                    - strong [ref=e576]: "Qwen: Qwen3.8 Max (0902)"
                    - generic [ref=e577]: qwen/qwen3.8-max-0902
                - 'button "Meta: Muse Spark 1.3 Contributor meta/muse-spark-1.3-contributor" [ref=e580] [cursor=pointer]':
                  - generic [ref=e582]:
                    - strong [ref=e583]: "Meta: Muse Spark 1.3 Contributor"
                    - generic [ref=e584]: meta/muse-spark-1.3-contributor
                - 'button "Meta: Muse Spark 1.3 meta/muse-spark-1.3" [ref=e587] [cursor=pointer]':
                  - generic [ref=e589]:
                    - strong [ref=e590]: "Meta: Muse Spark 1.3"
                    - generic [ref=e591]: meta/muse-spark-1.3
                - 'button "Google: Gemini 3.8 Flash google/gemini-3.8-flash" [ref=e594] [cursor=pointer]':
                  - generic [ref=e596]:
                    - strong [ref=e597]: "Google: Gemini 3.8 Flash"
                    - generic [ref=e598]: google/gemini-3.8-flash
                - 'button "Google: Gemini 3.8 Flash (batch) google/gemini-3.8-flash:batch" [ref=e601] [cursor=pointer]':
                  - generic [ref=e603]:
                    - strong [ref=e604]: "Google: Gemini 3.8 Flash (batch)"
                    - generic [ref=e605]: google/gemini-3.8-flash:batch
                - 'button "Anthropic: Claude Fable 5.1 anthropic/claude-fable-5.1" [ref=e608] [cursor=pointer]':
                  - generic [ref=e610]:
                    - strong [ref=e611]: "Anthropic: Claude Fable 5.1"
                    - generic [ref=e612]: anthropic/claude-fable-5.1
                - 'button "Anthropic: Claude Fable 5.1 (batch) anthropic/claude-fable-5.1:batch" [ref=e615] [cursor=pointer]':
                  - generic [ref=e617]:
                    - strong [ref=e618]: "Anthropic: Claude Fable 5.1 (batch)"
                    - generic [ref=e619]: anthropic/claude-fable-5.1:batch
                - 'button "IBM: Granite 4.2 8B ibm-granite/granite-4.2-8b" [ref=e622] [cursor=pointer]':
                  - generic [ref=e624]:
                    - strong [ref=e625]: "IBM: Granite 4.2 8B"
                    - generic [ref=e626]: ibm-granite/granite-4.2-8b
                - 'button "Tencent: Hy4 preview tencent/hy4-preview" [ref=e629] [cursor=pointer]':
                  - generic [ref=e631]:
                    - strong [ref=e632]: "Tencent: Hy4 preview"
                    - generic [ref=e633]: tencent/hy4-preview
                - 'button "inclusionAI: Ling 3.0 Flash Fin inclusionai/ling-3.0-flash-fin" [ref=e636] [cursor=pointer]':
                  - generic [ref=e638]:
                    - strong [ref=e639]: "inclusionAI: Ling 3.0 Flash Fin"
                    - generic [ref=e640]: inclusionai/ling-3.0-flash-fin
                - 'button "inclusionAI: Ling 3.0 Flash Fin (free) inclusionai/ling-3.0-flash-fin:free" [ref=e643] [cursor=pointer]':
                  - generic [ref=e645]:
                    - strong [ref=e646]: "inclusionAI: Ling 3.0 Flash Fin (free)"
                    - generic [ref=e647]: inclusionai/ling-3.0-flash-fin:free
                - 'button "Z.ai: GLM Flash Latest ~z-ai/glm-flash-latest" [ref=e650] [cursor=pointer]':
                  - generic [ref=e652]:
                    - strong [ref=e653]: "Z.ai: GLM Flash Latest"
                    - generic [ref=e654]: ~z-ai/glm-flash-latest
                - 'button "Qwen: Qwen3.8 Flash qwen/qwen3.8-flash" [ref=e657] [cursor=pointer]':
                  - generic [ref=e659]:
                    - strong [ref=e660]: "Qwen: Qwen3.8 Flash"
                    - generic [ref=e661]: qwen/qwen3.8-flash
                - 'button "Z.ai: GLM 5.3 Flash z-ai/glm-5.3-flash" [ref=e664] [cursor=pointer]':
                  - generic [ref=e666]:
                    - strong [ref=e667]: "Z.ai: GLM 5.3 Flash"
                    - generic [ref=e668]: z-ai/glm-5.3-flash
                - 'button "Z.ai: GLM 5.3 Flash (batch) z-ai/glm-5.3-flash:batch" [ref=e671] [cursor=pointer]':
                  - generic [ref=e673]:
                    - strong [ref=e674]: "Z.ai: GLM 5.3 Flash (batch)"
                    - generic [ref=e675]: z-ai/glm-5.3-flash:batch
                - 'button "Meta: Muse Spark 1.2 Contributor meta/muse-spark-1.2-contributor" [ref=e678] [cursor=pointer]':
                  - generic [ref=e680]:
                    - strong [ref=e681]: "Meta: Muse Spark 1.2 Contributor"
                    - generic [ref=e682]: meta/muse-spark-1.2-contributor
              - button "Show more models (406 remaining)" [ref=e685] [cursor=pointer]
            - button "Hide model details" [active] [ref=e686] [cursor=pointer]
            - generic [ref=e687]:
              - generic [ref=e688]:
                - text: Library name
                - textbox "Library name" [ref=e689]:
                  - /placeholder: A name you'll recognize
              - generic [ref=e690]:
                - text: Model ID
                - textbox "Model ID Filled in when you choose from the catalog." [ref=e691]
                - generic [ref=e692]: Filled in when you choose from the catalog.
            - group [ref=e693]:
              - generic "Usage cost · price unavailable" [ref=e694] [cursor=pointer]
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
            - button "Add to library" [disabled] [ref=e700]
```

# Test source

```ts
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
  145 |   await dialog.getByLabel("Writing price").fill("0.2");
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
> 179 |   await dialog.getByLabel("Model ID", { exact: true }).fill("sample/model");
      |                                                        ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  246 |     await page.getByRole("button", { name: "Create project" }).click();
  247 |     await page.getByRole("button", { name: "Plan this game" }).click();
  248 |     await expect(
  249 |       page.getByRole("button", { name: "Approve specification" }),
  250 |     ).toBeDisabled();
  251 |     await page.getByRole("button", { name: "Desktop", exact: true }).click();
  252 |     await page
  253 |       .getByRole("button", { name: "Save answers & update plan" })
  254 |       .click();
  255 |     await expect(
  256 |       page.getByRole("button", { name: "Approve specification" }),
  257 |     ).toBeEnabled();
  258 |     await expect(
  259 |       page.getByText("From your clarification", { exact: false }),
  260 |     ).toBeVisible();
  261 |     await page.screenshot({
  262 |       path: `docs/results/forge-v2-brief-${testInfo.project.name}.png`,
  263 |       fullPage: true,
  264 |     });
  265 |     await page.getByRole("button", { name: "Approve specification" }).click();
  266 |     await page.getByRole("button", { name: "Generate game" }).click();
  267 |     await expect(
  268 |       page.getByText("ready to test", { exact: true }),
  269 |     ).toBeVisible();
  270 |     await page.getByRole("tab", { name: "Source", exact: true }).click();
  271 |     await expect(page.locator("code")).toContainText("Harvest");
  272 |     await expect(page.locator("code")).not.toContainText("CombatCore");
  273 |     await expect(
  274 |       page.getByRole("link", { name: "Download place" }),
  275 |     ).toBeVisible();
  276 |     const projectId = new URL(page.url()).searchParams.get("project");
  277 |     await page.route("**/api/projects/" + projectId, async (route) => {
  278 |       const response = await route.fetch();
  279 |       const project = await response.json();
```