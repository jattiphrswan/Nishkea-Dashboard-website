# Product requirements
## Design record
ID, name, slug, category, description, collection, material, finish, care, supplier references, photos with alt text, publish state, lifecycle state, launch/review/selling-end dates and reorder policy.

## Variant record
Unique SKU; optional barcode; colour; size; material when stock differs; sales unit; retail price; optional wholesale price; weight/dimensions for shipping; active flag. Supplier cost is private and stored on receipts/cost records, with an optional restricted current cost reference.

Unique design + normalized option combination prevents duplicate variants. Slugs and SKUs have uniqueness constraints. A design may have one default variant. Referenced variants cannot be deleted; archive them.

## Category behavior
Earrings: pair versus single explicit. Rings: size system and size guide. Hair accessories: piece versus multipack explicit. Necklaces: set contents and chain length when applicable. Nose rings: size/closure details where supplied. Never invent anti-allergy or material claims.

## Catalogue tools
Create/edit drafts, duplicate into a new design with a new SKU, variant matrix, bulk import preview with row errors, filters, image ordering, publish validation and archive.

## Collection dimensions
Collection type: permanent, trial, seasonal, limited, monthly trend.
Lifecycle: draft, active, under review, clearance, discontinued, archived.
Publication: draft, published, hidden.
These are separate fields: being published does not make stock sellable, and being clearance does not mean expired.

## Required publish gate
Name, category, SKU, price, sales unit, approved image, accurate options and valid lifecycle. Out-of-stock visibility configurable. Discontinued products are not purchasable; historical order links remain meaningful.
