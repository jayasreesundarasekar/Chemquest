# Cosmic MoleculeLab — Organic Chemistry Virtual Laboratory

demo link: https://chemquest-virtualuniverse.netlify.app/

A responsive, static Netlify application with a cosmic visual theme and an interactive SMILES chemistry workspace.

## Included
- Searchable catalog of 250 organic compound names; selecting a compound resolves its current PubChem record and SMILES.
- SMILES input and validation using RDKit.js in the browser.
- RDKit 2D molecular depictions and locally calculated molecular descriptors.
- PubChem 3D SDF retrieval for supported structures, displayed with 3Dmol.js.
- Ball-and-stick, stick, space-filling, wireframe and line render styles.
- Molecular property report, canonical/isomeric SMILES display, copy and text report export.
- Theory, structure-property learning, assessment and final-report sections.
- Responsive navigation and mobile layout.

## Run / deploy
Open `index.html` through a local static server or deploy this folder to Netlify (publish directory `.`). No backend is required.

## External services and limitations
The application uses RDKit.js and 3Dmol.js from public CDNs and PubChem PUG REST for compound lookups and 3D SDF records. An internet connection is required for these features. PubChem may not have a 3D conformer for every arbitrary SMILES; in that case the app still provides the RDKit 2D structure and descriptors and clearly reports that 3D data was unavailable. The 250-item list is a searchable compound-name catalog; some names may not resolve in PubChem or may resolve to a different standardized synonym. Verify chemical identity before using results academically or experimentally.

Calculated descriptors are computational estimates, not experimental measurements. This is an educational tool, not a substitute for validated cheminformatics workflows or laboratory data.
