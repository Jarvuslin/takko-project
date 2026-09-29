# Models and provider connections

Match the supplied Models reference with Takko's existing typography, mascot and surfaces. A provider connection owns one validated key, shared by models at the same endpoint. Windows saves it with CurrentUser DPAPI so restarting does not require re-entry.

## Scope

- In: Models layout, provider validation, reusable encrypted credentials, current desktop package and shortcut.
- Out: paid inference, generation changes, existing server restarts, unrelated workspace redesign.

## Actions

1. Inspect current settings, catalogs, desktop packaging and shortcut.
2. Add endpoint-bound provider connections and encrypted Windows storage with fail-closed errors.
3. Validate through non-inference provider endpoints before exposing catalogs or saving new models.
4. Build saved-model and provider sections with filters, clear cost labels and connection setup.
5. Test rejected keys, provider reuse, endpoint isolation, restart persistence and browser flows.
6. Inspect desktop/mobile screenshots and refine spacing and hierarchy.
7. Run all npm run check stages and preserve exact results and failures.
8. Package into a new release directory and update the existing shortcut without stopping a service.

## Visual specification

The Models title and primary Add model action lead. Two quiet rounded surfaces contain the saved library and provider explorer. Use the existing font and icons, neutral black backgrounds, subtle one-pixel borders, 24px panel spacing and compact rows. Provider colors belong only to brand tiles. Saved rows separate identity, connection and reply limit. Catalog rows show only provider-reported metadata and reading/writing rates. Search and provider filters stay within their section. A focused dialog first validates the provider, then unlocks model selection and optional details. Connected providers reuse their hidden key. Controls use existing focus styles and short color transitions, without decorative animation.

Validation proves authentication/catalog access, not paid inference or model suitability. OpenRouter uses its authenticated /key endpoint before its public catalog. Other providers use authenticated model listing. Windows encryption is separate from project JSON. Legacy imported profiles can exist without a connection but are visibly disconnected.
