// ╔══════════════════════════════════════════════════════════════╗
// ║  CANCIONERO · Grupo de Música Iglesia                        ║
// ║  Reemplaza FIREBASE_CONFIG con tus credenciales reales       ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useMemo, useEffect } from "react";

// ─── Music Engine ────────────────────────────────────────────────
const NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

function noteIndex(note) {
  let i = NOTES_SHARP.indexOf(note);
  if (i === -1) i = NOTES_FLAT.indexOf(note);
  return i;
}
function transposeNote(note, semitones) {
  const idx = noteIndex(note);
  if (idx === -1) return note;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return semitones >= 0 ? NOTES_SHARP[newIdx] : NOTES_FLAT[newIdx];
}
const CHORD_RE = /\b([A-G][b#]?)(maj7|maj|min7|min|m7|m|7|sus2|sus4|dim7|dim|aug|add9|9|11|13)?(\/[A-G][b#]?)?\b/g;
function transposeChord(chord, semitones) {
  return chord.replace(CHORD_RE, (match, root, quality="", bass="") => {
    const newRoot = transposeNote(root, semitones);
    const newBass = bass ? "/"+transposeNote(bass.slice(1), semitones) : "";
    return newRoot+quality+newBass;
  });
}
function transposeLine(line, semitones) {
  if (semitones === 0) return line;
  return line.replace(CHORD_RE, (match) => transposeChord(match, semitones));
}

// ─── Firebase loader (CDN, no bundler needed) ────────────────────
// Cuando despliegues en Vercel, reemplaza estos valores:
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBRNUVu8I2arbWFOheN5q-kAqAgA_pyFic",
  authDomain:        "filadelfia-musical.firebaseapp.com",
  projectId:         "filadelfia-musical",
  storageBucket:     "filadelfia-musical.firebasestorage.app",
  messagingSenderId: "841076257801",
  appId:             "1:841076257801:web:918ecdea882ce53735b4d8"
};

// Hook que carga Firebase dinámicamente desde CDN
function useFirebase() {
  const [fb, setFb] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const configured = !FIREBASE_CONFIG.apiKey.includes("TU_");
    if (!configured) { setReady(true); return; }

    async function load() {
      try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
        const { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp }
          = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const app = initializeApp(FIREBASE_CONFIG);
        const db  = getFirestore(app);
        setFb({ db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp });
      } catch(e) { console.error("Firebase error:", e); }
      setReady(true);
    }
    load();
  }, []);

  return { fb, ready, connected: !!fb };
}

// ─── Demo songs ───────────────────────────────────────────────────
const DEMO_SONGS = [
  {
    id:"demo1", title:"Cuán Grande Es Él", author:"Stuart K. Hine",
    key:"G", tempo:"Lento", tags:["alabanza","adoración"],
    content:`[Verso 1]
G                    C
Señor mi Dios, al contemplar los cielos,
G              D
el firmamento y las estrellas mil,
G                C
al oír tu voz en los poderosos truenos
G           D      G
y ver brillar al sol en su cenit.

[Coro]
G        C         G
Mi alma canta a ti, Señor:
         D
¡Cuán grande es Él!
G        C         G
Mi alma canta a ti, Señor:
         D      G
¡Cuán grande es Él!`
  },
  {
    id:"demo2", title:"Santo, Santo, Santo", author:"Reginald Heber",
    key:"D", tempo:"Moderato", tags:["adoración","Trinidad"],
    content:`[Verso 1]
D              G    D
Santo, santo, santo, Señor omnipotente,
A                    D
siempre el labio mío loores te dará.
D              G     D
Santo, santo, santo, te adoro reverente,
A                    D
Dios en tres personas, bendita Trinidad.`
  },
  {
    id:"demo3", title:"Sublime Gracia", author:"John Newton",
    key:"A", tempo:"Lento", tags:["gracia","salvación"],
    content:`[Verso 1]
A              D
Sublime gracia del Señor
A           E
que a un infeliz salvó;
A              D
fui ciego mas hoy veo yo,
A    E     A
perdido y Él me halló.`
  }
];

const KEYS   = ["C","C#","Db","D","Eb","E","F","F#","Gb","G","Ab","A","Bb","B"];
const TEMPOS = ["Lento","Moderato","Alegre","Rápido","Libre"];
const SEMITONES = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];

// ─── Styles ───────────────────────────────────────────────────────
const inp = {
  width:"100%", background:"#0d1f17", border:"1px solid #2d4a38",
  borderRadius:6, color:"#e8f5ef", padding:"8px 12px",
  fontFamily:"'Crimson Pro',serif", fontSize:15, outline:"none", boxSizing:"border-box"
};
const lbl = {
  display:"block", marginBottom:4, color:"#7ecba0",
  fontFamily:"'Crimson Pro',serif", fontSize:11, letterSpacing:1, textTransform:"uppercase"
};
const btnP = {
  background:"linear-gradient(135deg,#2d7a50,#1a5235)", color:"#e8f5ef",
  border:"none", borderRadius:8, padding:"9px 20px", cursor:"pointer",
  fontFamily:"'Crimson Pro',serif", fontSize:15, fontWeight:600
};
const btnS = {
  background:"#0d1f17", color:"#7ecba0", border:"1px solid #2d4a38",
  borderRadius:8, padding:"8px 16px", cursor:"pointer",
  fontFamily:"'Crimson Pro',serif", fontSize:14
};
const btnD = { ...btnS, color:"#e07070", borderColor:"#5a2020" };
const card = { background:"#0a1a11", border:"1px solid #1a3022", borderRadius:12 };

// ─── Tag ──────────────────────────────────────────────────────────
function Tag({ label, onRemove }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:"#1a3a2a", color:"#7ecba0", border:"1px solid #2d6645",
      borderRadius:20, padding:"2px 10px", fontSize:11, fontFamily:"'Crimson Pro',serif"
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{background:"none",border:"none",color:"#7ecba0",cursor:"pointer",padding:0,lineHeight:1,fontSize:13}}>×</button>
      )}
    </span>
  );
}

// ─── Firebase setup banner ────────────────────────────────────────
function SetupBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{background:"#141408",border:"1px solid #5a4a10",borderRadius:10,padding:"10px 16px",marginBottom:20,fontFamily:"'Crimson Pro',serif",fontSize:13,color:"#c8b060"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <span>⚠️ <strong>Modo demo</strong> — los cambios no se guardan entre sesiones.</span>
        <button onClick={()=>setOpen(o=>!o)} style={{...btnS,fontSize:11,padding:"3px 10px",color:"#c8b060",borderColor:"#5a4a10",whiteSpace:"nowrap"}}>
          {open?"Ocultar guía":"Conectar Firebase"}
        </button>
      </div>
      {open && (
        <div style={{marginTop:14,lineHeight:2,color:"#d4c880",borderTop:"1px solid #3a3010",paddingTop:12}}>
          <p style={{fontWeight:600,marginBottom:4}}>Pasos para conectar (gratis, 5 minutos):</p>
          <p><strong>1.</strong> Entra a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{color:"#f0d060"}}>console.firebase.google.com</a> y crea un proyecto nuevo</p>
          <p><strong>2.</strong> En el menú lateral → <em>Firestore Database</em> → "Crear base de datos" → modo producción</p>
          <p><strong>3.</strong> Ve a ⚙️ Configuración del proyecto → "Tu app" → Registra una <em>app web</em> → copia el objeto <code>firebaseConfig</code></p>
          <p><strong>4.</strong> En el código de la app reemplaza el objeto <code>FIREBASE_CONFIG</code> con tus valores</p>
          <p><strong>5.</strong> En Firestore → <em>Reglas</em>, pega lo siguiente y publica:</p>
          <pre style={{background:"#080800",padding:"10px 14px",borderRadius:6,fontSize:11,marginTop:4,overflowX:"auto",lineHeight:1.6}}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /canciones/{id} {
      allow read, write: if true;
    }
  }
}`}
          </pre>
          <p style={{marginTop:8,fontSize:12,color:"#807040"}}>✅ Listo — todos en el grupo verán los cambios en tiempo real al abrir la URL.</p>
        </div>
      )}
    </div>
  );
}

// ─── SongForm ─────────────────────────────────────────────────────
function SongForm({ initial, onSave, onCancel }) {
  const blank = { title:"", author:"", key:"G", tempo:"Moderato", tags:[], content:"" };
  const [form, setForm] = useState(initial || blank);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags",[...form.tags,t]);
    setTagInput("");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><label style={lbl}>Título</label>
          <input style={inp} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Nombre de la canción"/>
        </div>
        <div><label style={lbl}>Autor</label>
          <input style={inp} value={form.author} onChange={e=>set("author",e.target.value)} placeholder="Compositor"/>
        </div>
        <div><label style={lbl}>Tonalidad original</label>
          <select style={inp} value={form.key} onChange={e=>set("key",e.target.value)}>
            {KEYS.map(k=><option key={k}>{k}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Tempo</label>
          <select style={inp} value={form.tempo} onChange={e=>set("tempo",e.target.value)}>
            {TEMPOS.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={lbl}>Etiquetas</label>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <input style={{...inp,flex:1}} value={tagInput}
            onChange={e=>setTagInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addTag())}
            placeholder="adoración, gracia… (Enter para agregar)"/>
          <button onClick={addTag} style={btnS}>+</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {form.tags.map(t=><Tag key={t} label={t} onRemove={()=>set("tags",form.tags.filter(x=>x!==t))}/>)}
        </div>
      </div>

      <div>
        <label style={lbl}>Letra y Acordes</label>
        <p style={{fontSize:11,color:"#5a8a6a",margin:"2px 0 6px",fontFamily:"monospace"}}>
          Escribe los acordes en la línea sobre la letra: G · Am · C/E · Dm7
        </p>
        <textarea style={{...inp,minHeight:220,resize:"vertical",fontFamily:"'Courier Prime',monospace",fontSize:13,lineHeight:1.7}}
          value={form.content}
          onChange={e=>set("content",e.target.value)}
          placeholder={`[Verso 1]\nG              C\nSanta, santa es tu presencia…`}
        />
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={btnS}>Cancelar</button>
        <button disabled={saving||!form.title.trim()} style={btnP} onClick={async()=>{setSaving(true);await onSave(form);setSaving(false);}}>
          {saving?"Guardando…":"💾 Guardar canción"}
        </button>
      </div>
    </div>
  );
}

// ─── SongViewer ───────────────────────────────────────────────────
function SongViewer({ song, onEdit, onBack }) {
  const [semitones, setSemitones] = useState(0);

  const newKeyIdx = ((noteIndex(song.key)+semitones)%12+12)%12;
  const displayKey = semitones>=0 ? NOTES_SHARP[newKeyIdx] : NOTES_FLAT[newKeyIdx];

  const transposedContent = useMemo(
    ()=>song.content.split("\n").map(l=>transposeLine(l,semitones)).join("\n"),
    [song.content,semitones]
  );

  const renderContent = (text) => text.split("\n").map((line,i)=>{
    const isSection = line.startsWith("[")&&line.endsWith("]");
    const isChord = /^\s*([A-G][b#]?(maj7|maj|min7|min|m7|m|7|sus2|sus4|dim|aug|add9)?(\s+|\/[A-G][b#]?)*\s*)+$/.test(line)&&line.trim();
    if (isSection) return <div key={i} style={{color:"#7ecba0",fontWeight:700,marginTop:16,marginBottom:4,fontSize:11,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Crimson Pro',serif"}}>{line}</div>;
    if (isChord)   return <div key={i} style={{color:"#a8e6c0",fontFamily:"'Courier Prime',monospace",fontSize:14,fontWeight:700,letterSpacing:1}}>{line}</div>;
    return <div key={i} style={{color:"#d4ead9",fontFamily:"'Crimson Pro',serif",fontSize:16,lineHeight:1.6}}>{line||"\u00A0"}</div>;
  });

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <button onClick={onBack} style={{...btnS,marginBottom:10,fontSize:12}}>← Volver</button>
          <h2 style={{margin:0,color:"#e8f5ef",fontFamily:"'Playfair Display',serif",fontSize:26}}>{song.title}</h2>
          <p style={{margin:"4px 0 0",color:"#7ecba0",fontFamily:"'Crimson Pro',serif",fontSize:14}}>{song.author} · {song.tempo}</p>
          <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
            {(song.tags||[]).map(t=><Tag key={t} label={t}/>)}
          </div>
        </div>
        <button onClick={onEdit} style={btnS}>✏️ Editar</button>
      </div>

      {/* Transposer */}
      <div style={{...card,padding:16,marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Crimson Pro',serif",color:"#7ecba0",fontSize:13,flexShrink:0}}>🎵 Transponer</span>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",flex:1}}>
            {SEMITONES.map(v=>(
              <button key={v} onClick={()=>setSemitones(v)} style={{
                padding:"4px 9px",borderRadius:6,fontSize:12,fontFamily:"monospace",cursor:"pointer",border:"1px solid",
                background:semitones===v?"#2d6645":"#0d1f17",
                color:semitones===v?"#fff":"#7ecba0",
                borderColor:semitones===v?"#4a9e6a":"#2d4a38",
                fontWeight:semitones===v?700:400
              }}>{v>0?`+${v}`:v}</button>
            ))}
          </div>
          <div style={{background:"#1a3a2a",border:"1px solid #2d6645",borderRadius:8,padding:"6px 14px",textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:9,color:"#5a8a6a",fontFamily:"'Crimson Pro',serif",letterSpacing:1,textTransform:"uppercase"}}>Tono actual</div>
            <div style={{fontSize:24,fontWeight:800,color:"#a8e6c0",fontFamily:"'Playfair Display',serif",lineHeight:1}}>{displayKey}</div>
          </div>
        </div>
      </div>

      <div style={{...card,padding:"20px 24px",lineHeight:1.8}}>
        {renderContent(transposedContent)}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function Cancionero() {
  const { fb, ready, connected } = useFirebase();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");

  // Firestore listener
  useEffect(() => {
    if (!ready) return;
    if (!fb) {
      setSongs(DEMO_SONGS);
      setLoading(false);
      return;
    }
    const { db, collection, onSnapshot } = fb;
    const unsub = onSnapshot(collection(db,"canciones"), snap=>{
      const data = snap.docs.map(d=>({id:d.id,...d.data()}));
      data.sort((a,b)=>(a.title||"").localeCompare(b.title||""));
      setSongs(data);
      setLoading(false);
    }, err=>{
      console.error(err);
      setSongs(DEMO_SONGS);
      setLoading(false);
    });
    return unsub;
  }, [ready, fb]);

  const saveSong = async (data) => {
    if (!fb) {
      if (view==="edit") {
        setSongs(s=>s.map(x=>x.id===selected.id?{...data,id:selected.id}:x));
        setSelected({...data,id:selected.id});
      } else {
        const ns={...data,id:"local_"+Date.now()};
        setSongs(s=>[...s,ns]);
        setSelected(ns);
      }
      setView("view"); return;
    }
    const { db, collection, doc, addDoc, updateDoc, serverTimestamp } = fb;
    if (view==="edit") {
      await updateDoc(doc(db,"canciones",selected.id),{...data,updatedAt:serverTimestamp()});
      setSelected({...data,id:selected.id});
    } else {
      const ref = await addDoc(collection(db,"canciones"),{...data,createdAt:serverTimestamp()});
      setSelected({...data,id:ref.id});
    }
    setView("view");
  };

  const deleteSong = async (id) => {
    if (!confirm("¿Eliminar esta canción? No se puede deshacer.")) return;
    if (fb) {
      const { db, doc, deleteDoc } = fb;
      await deleteDoc(doc(db,"canciones",id));
    } else {
      setSongs(s=>s.filter(x=>x.id!==id));
    }
    setView("list"); setSelected(null);
  };

  const allTags = useMemo(()=>{
    const s=new Set();
    songs.forEach(song=>(song.tags||[]).forEach(t=>s.add(t)));
    return [...s].sort();
  },[songs]);

  const filtered = useMemo(()=>{
    const q=search.toLowerCase();
    return songs.filter(s=>
      (!q||(s.title||"").toLowerCase().includes(q)||(s.author||"").toLowerCase().includes(q)||(s.key||"").toLowerCase().includes(q))&&
      (!filterTag||(s.tags||[]).includes(filterTag))
    );
  },[songs,search,filterTag]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#071209;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:#071209;}
        ::-webkit-scrollbar-thumb{background:#2d4a38;border-radius:3px;}
        input::placeholder,textarea::placeholder{color:#3a5a46;}
        select option{background:#0d1f17;}
        button:disabled{opacity:.5;cursor:not-allowed;}
      `}</style>

      <div style={{minHeight:"100vh",background:"#071209",backgroundImage:"radial-gradient(ellipse at 20% 20%,#0d2a1a 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,#091a10 0%,transparent 60%)",color:"#e8f5ef"}}>

        {/* Header */}
        <header style={{borderBottom:"1px solid #1a3022",background:"#071209ee",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10}}>
            <span style={{fontSize:22}}>🎼</span>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:900,color:"#a8e6c0",lineHeight:1}}>Cancionero</h1>
              <p style={{fontSize:10,color:connected?"#4a9e6a":"#7a6a20",letterSpacing:2,textTransform:"uppercase",fontFamily:"'Crimson Pro',serif"}}>
                {connected?"🔥 Sincronizado en tiempo real":"⚠️ Modo demo"}
              </p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:12,color:"#4a7a5a",fontFamily:"'Crimson Pro',serif"}}>{songs.length} canciones</span>
            {view!=="add"&&<button onClick={()=>{setView("add");setSelected(null);}} style={btnP}>+ Nueva</button>}
          </div>
        </header>

        <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px"}}>
          {!connected && <SetupBanner/>}

          {(!ready||loading) ? (
            <div style={{textAlign:"center",padding:60,color:"#4a7a5a",fontFamily:"'Crimson Pro',serif",fontSize:16}}>Cargando canciones… 🎵</div>
          ) : (
            <>
              {/* LIST */}
              {view==="list"&&(
                <div>
                  <div style={{display:"flex",gap:10,marginBottom:20}}>
                    <input style={{flex:1,background:"#0d1f17",border:"1px solid #2d4a38",borderRadius:8,color:"#e8f5ef",padding:"9px 14px",fontFamily:"'Crimson Pro',serif",fontSize:15,outline:"none"}}
                      placeholder="🔍  Buscar por título, autor o tono…" value={search} onChange={e=>setSearch(e.target.value)}/>
                    {allTags.length>0&&(
                      <select style={{background:"#0d1f17",border:"1px solid #2d4a38",borderRadius:8,color:"#7ecba0",padding:"9px 12px",fontFamily:"'Crimson Pro',serif",fontSize:14,outline:"none"}}
                        value={filterTag} onChange={e=>setFilterTag(e.target.value)}>
                        <option value="">Todas</option>
                        {allTags.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                  </div>

                  {filtered.length===0?(
                    <div style={{textAlign:"center",padding:60,color:"#3a5a46",fontFamily:"'Crimson Pro',serif",fontSize:16}}>
                      {songs.length===0?"Agrega tu primera canción 🎶":"Sin resultados"}
                    </div>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {filtered.map(song=>(
                        <div key={song.id} onClick={()=>{setSelected(song);setView("view");}}
                          style={{...card,padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"border-color .15s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor="#2d6645"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor="#1a3022"}>
                          <div style={{width:42,height:42,borderRadius:8,background:"#1a3a2a",border:"1px solid #2d6645",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,color:"#7ecba0",fontSize:15}}>{song.key}</span>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#e8f5ef",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{song.title}</div>
                            <div style={{fontFamily:"'Crimson Pro',serif",fontSize:13,color:"#5a8a6a"}}>{song.author} · {song.tempo}</div>
                          </div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",flexShrink:0}}>
                            {(song.tags||[]).slice(0,2).map(t=><Tag key={t} label={t}/>)}
                          </div>
                          <span style={{color:"#3a5a46",fontSize:18}}>›</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW */}
              {view==="view"&&selected&&(
                <div>
                  <SongViewer song={selected} onBack={()=>setView("list")} onEdit={()=>setView("edit")}/>
                  <div style={{marginTop:16,textAlign:"right"}}>
                    <button onClick={()=>deleteSong(selected.id)} style={btnD}>🗑 Eliminar canción</button>
                  </div>
                </div>
              )}

              {/* ADD */}
              {view==="add"&&(
                <div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:20,color:"#a8e6c0"}}>Nueva Canción</h2>
                  <div style={{...card,padding:24}}><SongForm onSave={saveSong} onCancel={()=>setView("list")}/></div>
                </div>
              )}

              {/* EDIT */}
              {view==="edit"&&selected&&(
                <div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:20,color:"#a8e6c0"}}>Editar: {selected.title}</h2>
                  <div style={{...card,padding:24}}><SongForm initial={selected} onSave={saveSong} onCancel={()=>setView("view")}/></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
