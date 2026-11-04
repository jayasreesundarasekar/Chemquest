const ORGANIC_MOLECULES = ["Methane", "Ethane", "Propane", "Butane", "Pentane", "Hexane", "Heptane", "Octane", "Nonane", "Decane", "Ethene", "Propene", "1-Butene", "1-Pentene", "1-Hexene", "Ethylene glycol", "Propylene glycol", "Ethanol", "Methanol", "1-Propanol", "2-Propanol", "1-Butanol", "2-Butanol", "tert-Butanol", "1-Pentanol", "1-Hexanol", "1-Heptanol", "1-Octanol", "Glycerol", "Cyclohexanol", "Benzyl alcohol", "Phenol", "Catechol", "Resorcinol", "Hydroquinone", "1-Naphthol", "2-Naphthol", "Formaldehyde", "Acetaldehyde", "Propanal", "Butanal", "Benzaldehyde", "Acetone", "2-Butanone", "2-Pentanone", "Cyclohexanone", "Acetophenone", "Benzophenone", "Formic acid", "Acetic acid", "Propionic acid", "Butyric acid", "Valeric acid", "Caproic acid", "Oxalic acid", "Malonic acid", "Succinic acid", "Glutaric acid", "Adipic acid", "Benzoic acid", "Salicylic acid", "Cinnamic acid", "Lactic acid", "Citric acid", "Tartaric acid", "Malic acid", "Oleic acid", "Stearic acid", "Palmitic acid", "Acrylic acid", "Methacrylic acid", "Fumaric acid", "Maleic acid", "Glycine", "Alanine", "Valine", "Leucine", "Isoleucine", "Serine", "Threonine", "Cysteine", "Methionine", "Aspartic acid", "Glutamic acid", "Asparagine", "Glutamine", "Lysine", "Arginine", "Histidine", "Phenylalanine", "Tyrosine", "Tryptophan", "Proline", "Hydroxyproline", "Urea", "Thiourea", "Acetamide", "Formamide", "Benzamide", "N,N-Dimethylformamide", "Acetonitrile", "Propionitrile", "Benzonitrile", "Nitromethane", "Nitrobenzene", "Aniline", "Toluidine", "N,N-Dimethylaniline", "Pyridine", "Pyrrole", "Furan", "Thiophene", "Imidazole", "Pyrazole", "Pyrimidine", "Purine", "Indole", "Quinoline", "Isoquinoline", "Piperidine", "Piperazine", "Morpholine", "Anisole", "Phenetole", "Diphenyl ether", "Benzene", "Toluene", "Ethylbenzene", "Styrene", "o-Xylene", "m-Xylene", "p-Xylene", "Cumene", "Mesitylene", "Naphthalene", "Anthracene", "Phenanthrene", "Biphenyl", "Fluorene", "Fluoranthene", "Pyrene", "Benzyl chloride", "Chloroform", "Dichloromethane", "Carbon tetrachloride", "Chlorobenzene", "Bromobenzene", "Iodobenzene", "Vinyl chloride", "1,2-Dichloroethane", "Trichloroethylene", "Tetrachloroethylene", "Ethyl acetate", "Methyl acetate", "Propyl acetate", "Butyl acetate", "Isoamyl acetate", "Methyl benzoate", "Ethyl benzoate", "Dimethyl carbonate", "Diethyl carbonate", "Ethyl formate", "Methyl butyrate", "Methyl salicylate", "Lactone", "Diethyl ether", "Dimethyl ether", "Tetrahydrofuran", "1,4-Dioxane", "Dibutyl ether", "Acetic anhydride", "Phthalic anhydride", "Maleic anhydride", "Benzylamine", "Ethylamine", "Diethylamine", "Triethylamine", "Methylamine", "Dimethylamine", "Trimethylamine", "Ethanolamine", "Triethanolamine", "Acetamidine", "Guanidine", "Hexamethylenetetramine", "Glucose", "Fructose", "Galactose", "Ribose", "Deoxyribose", "Sucrose", "Lactose", "Maltose", "Cellobiose", "Starch repeat unit", "Cellulose repeat unit", "Ascorbic acid", "Dehydroascorbic acid", "Caffeine", "Theobromine", "Theophylline", "Aspirin", "Paracetamol", "Ibuprofen", "Naproxen", "Diclofenac", "Ketoprofen", "Lidocaine", "Benzocaine", "Procaine", "Menthol", "Camphor", "Vanillin", "Eugenol", "Limonene", "Citral", "Geraniol", "Linalool", "Menthone", "Thymol", "Carvacrol", "Cinnamaldehyde", "Coumarin", "Quercetin", "Resveratrol", "Curcumin", "Cholesterol", "Testosterone", "Estradiol", "Progesterone", "Cortisol", "Uric acid", "Creatinine", "Nicotinamide", "Nicotinic acid", "Pyridoxine", "Thiamine", "Riboflavin", "Biotin", "Folic acid", "Retinol", "Tocopherol", "Coenzyme Q10", "Melatonin", "Dopamine", "Serotonin", "Adrenaline", "Noradrenaline", "Histamine", "Acetylcholine"];

const $ = id => document.getElementById(id);

let rdkit=null,
currentMol=null,
currentCanonical='',
viewer3d=null,
currentSdf='';

const status = (s, bad=false)=>{
$('engine-status').textContent=s;
$('engine-status').style.color=bad?'#ff8aa8':'#8effc7';
};

const esc = s => String(s??'').replace(/[&<>"']/g,c=>({
'&':'&amp;',
'<':'&lt;',
'>':'&gt;',
'"':'&quot;',
"'":'&#39;'
}[c]));

const descriptorMap = [
['Molecular formula','formula'],
['Molecular weight (g/mol)','exactmw'],
['LogP',' CrippenClogP'],
['TPSA (Å²)','tpsa'],
['H-bond donors','NumHBD'],
['H-bond acceptors','NumHBA'],
['Rotatable bonds','NumRotatableBonds'],
['Heavy atoms','NumHeavyAtoms'],
['Formal charge','formal_charge'],
['Ring count','NumRings']
];

function setProps(d, extra={}){
const keys=[
['Molecular formula',d.MolecularFormula||d.formula],
['Molecular weight (g/mol)',d.MolecularWeight??d.exactmw],
['XLogP',d.XLogP??d.CrippenClogP],
['TPSA (Å²)',d.TPSA??d.tpsa],
['H-bond donors',d.HBondDonorCount??d.NumHBD],
['H-bond acceptors',d.HBondAcceptorCount??d.NumHBA],
['Rotatable bonds',d.RotatableBondCount??d.NumRotatableBonds],
['Heavy atoms',d.HeavyAtomCount??d.NumHeavyAtoms],
['Formal charge',d.Charge??d.formal_charge],
['Rings',d.RingCount??d.NumRings]
];

$('property-grid').innerHTML=keys.map(([k,v])=>
`<div class="property-cell"><small>${esc(k)}</small><strong>${v===undefined||v===null?'—':esc(typeof v==='number'?Number(v.toFixed(3)):v)}</strong></div>`
).join('')+
`<div class="property-cell wide"><small>Canonical SMILES</small><code>${esc(extra.canonical||'—')}</code></div><div class="property-cell wide"><small>Isomeric SMILES</small><code>${esc(extra.isomeric||extra.canonical||'—')}</code></div>`;

$('analysis-summary').textContent=
`This molecule has ${d.HeavyAtomCount??d.NumHeavyAtoms??'—'} heavy atoms, ${d.RingCount??d.NumRings??'—'} rings and an estimated lipophilicity of ${d.XLogP??d.CrippenClogP??'—'}.`;
}

function getMolDescriptors(mol){
try {
return JSON.parse(mol.get_descriptors());
} catch(e){
return {};
}
}

function draw3D(sdf){
if(!window.$3Dmol){
$('mol3d-viewer').innerHTML=
'<div class="viewer-placeholder">3D viewer library could not load. Check your internet connection.</div>';
return;
}

$('mol3d-viewer').innerHTML='';

viewer3d=$3Dmol.createViewer(
$('mol3d-viewer'),
{backgroundColor:'#080914',antialias:true}
);

viewer3d.addModel(sdf,'sdf');
apply3DStyle();
viewer3d.zoomTo();
viewer3d.render();
}

function apply3DStyle(){
if(!viewer3d)return;

const style=$('render-style').value;

viewer3d.setStyle({},
style==='ballstick'?{stick:{radius:.16},sphere:{scale:.24}}:
style==='stick'?{stick:{radius:.22}}:
style==='sphere'?{sphere:{scale:.85}}:
style==='wireframe'?{line:{linewidth:2}}:
{line:{linewidth:3}}
);

viewer3d.render();
}

async function pubchemFromSmiles(smiles){
const url=
'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/'+
encodeURIComponent(smiles)+
'/SDF?record_type=3d';

const r=await fetch(url,{
headers:{Accept:'chemical/x-mdl-sdfile'}
});

if(!r.ok)
throw new Error('3D conformer not available from PubChem for this notation.');

return await r.text();
}

async function analyze(smiles, name=''){
if(!rdkit){
status('Loading chemistry engine…');
return;
}

if(currentMol){
currentMol.delete();
currentMol=null;
}

try{
const mol=rdkit.get_mol(smiles);

if(!mol||mol.is_valid()===false){
if(mol)mol.delete();
throw new Error('This SMILES notation is invalid or unsupported.');
}

currentMol=mol;

const canonical=mol.get_smiles();
currentCanonical=canonical;

const svg=mol.get_svg();
$('structure-2d').innerHTML=svg;

const d=getMolDescriptors(mol);

let formula=
(typeof mol.get_molformula==='function'?mol.get_molformula():'')||
d.molFormula||
d.MolecularFormula||
'';

$('structure-meta').textContent=
(name?name+' · ':'')+
(formula||'Structure generated locally');

setProps(d,{canonical,isomeric:canonical});

status('2D structure and descriptors generated successfully.');

$('mol-name').textContent=
(name||'CUSTOM MOLECULE').toUpperCase();

$('mol-formula').textContent=formula||'—';

$('mol-note').textContent=
'Structure generated from the supplied SMILES notation using RDKit.';

try{
status('2D complete · requesting 3D conformer from PubChem…');

const sdf=await pubchemFromSmiles(smiles);
currentSdf=sdf;
draw3D(sdf);

status('Molecule analyzed · 3D conformer loaded.');

}catch(e){
currentSdf='';

$('mol3d-viewer').innerHTML=
'<div class="viewer-placeholder">No PubChem 3D conformer was available for this exact structure. The 2D structure and RDKit descriptors are ready. Try a known library compound for 3D coordinates.</div>';

status('2D and properties ready · 3D conformer unavailable for this input.');
}

}catch(e){
status(e.message||'Could not analyze this SMILES.',true);
}
}

async function lookupName(name){
status('Looking up '+name+' in PubChem…');

const url=
'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/'+
encodeURIComponent(name)+
'/property/CanonicalSMILES,IsomericSMILES,MolecularFormula,MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount/JSON';

const r=await fetch(url);

if(!r.ok)
throw new Error('PubChem could not find this compound.');

const j=await r.json();
const p=j.PropertyTable?.Properties?.[0];

if(!p)
throw new Error('No compound record found.');

$('smiles-input').value=
p.IsomericSMILES||
p.ConnectivitySMILES||
p.CanonicalSMILES;

await analyze($('smiles-input').value,name);

// Use authoritative PubChem property fields when available.
const local=getMolDescriptors(currentMol)||{};

setProps(
{...local,...p},
{
canonical:p.CanonicalSMILES,
isomeric:p.IsomericSMILES
}
);
}

function renderLibrary(filter=''){
const list=ORGANIC_MOLECULES.filter(n=>
n.toLowerCase().includes(filter.toLowerCase())
);

$('molecule-library').innerHTML=list.map(n=>
`<button class="library-item" data-name="${esc(n)}"><span>${esc(n)}</span><b>↗</b></button>`
).join('');

$('library-count').textContent=
`${list.length} / 250 COMPOUNDS`;

$('molecule-library').querySelectorAll('button').forEach(b=>
b.addEventListener('click',()=>
lookupName(b.dataset.name).catch(e=>status(e.message,true))
)
);
}

$('analyze-smiles').addEventListener('click',()=>
analyze($('smiles-input').value.trim())
);

$('load-example').addEventListener('click',()=>{
$('smiles-input').value='CC(=O)Oc1ccccc1C(=O)O';
analyze($('smiles-input').value,'Aspirin');
});

$('render-style').addEventListener('change',apply3DStyle);

$('reset-3d').addEventListener('click',()=>{
if(viewer3d){
viewer3d.zoomTo();
viewer3d.render();
}
});

$('library-search').addEventListener('input',e=>
renderLibrary(e.target.value)
);

$('copy-smiles').addEventListener('click',async()=>{
if(!currentCanonical)return;

await navigator.clipboard.writeText(currentCanonical);
status('Canonical SMILES copied.');
});

$('download-report').addEventListener('click',()=>{
if(!currentMol){
status('Analyze a molecule first.',true);
return;
}

const text=
`COSMIC MOLECULE LAB REPORT
Input SMILES: ${$('smiles-input').value}
Canonical SMILES: ${currentCanonical}

${$('property-grid').innerText}

Note: calculated/computed properties are estimates; 3D coordinates are sourced from PubChem when available.`;

const a=document.createElement('a');

a.href=URL.createObjectURL(
new Blob([text],{type:'text/plain'})
);

a.download='molecule-report.txt';
a.click();

URL.revokeObjectURL(a.href);
});

document.querySelectorAll('.quiz-options button').forEach(b=>
b.addEventListener('click',()=>{
$('quiz-feedback').textContent=
b.dataset.answer==='correct'
?'Correct! Matching digits indicate ring closures in SMILES.'
:'Not quite. In SMILES, matching digits indicate ring closures.';
})
);

renderLibrary();

if(window.initRDKitModule){
initRDKitModule()
.then(x=>{
rdkit=x;
status('RDKit chemistry engine ready.');
})
.catch(()=>
status('RDKit could not load. Check internet access.',true)
);
}
else{
status('RDKit library is unavailable. Check internet access.',true);
  }
