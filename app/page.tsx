'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';

// Replace these URLs with real photos!
const imgSrcs = Array.from({ length: 48 }, (_, i) => `https://picsum.photos/400/600?random=${i + 30}`);

const RINGS = [
  { lat: 80, count: 1, w: 85, h: 100 },
  { lat: 55, count: 5, w: 105, h: 125 },
  { lat: 25, count: 8, w: 118, h: 140 },
  { lat: -5, count: 9, w: 122, h: 144 },
  { lat: -35, count: 8, w: 118, h: 140 },
  { lat: -62, count: 5, w: 105, h: 125 },
  { lat: -85, count: 1, w: 85, h: 100 },
];

export default function BirthdayPage() {
  const [scene, setScene] = useState<number>(1);
  const cvsRef = useRef<HTMLCanvasElement>(null);

  // --- S2 State ---
  const [s2Ready, setS2Ready] = useState(false);
  const [s2Words, setS2Words] = useState({ happy: false, bday: false });
  const [hatVisible, setHatVisible] = useState(false);
  const [scrollItemsVisible, setScrollItemsVisible] = useState([false, false, false]);
  const [btnLetterVisible, setBtnLetterVisible] = useState(false);

  // --- S3 State ---
  const [s3Ready, setS3Ready] = useState(false);
  const [cardMsgVisible, setCardMsgVisible] = useState<boolean[]>([]);
  const [btnStartVisible, setBtnStartVisible] = useState(false);
  const cardMsg = 'Nhân ngày đặc biệt này, tôi muốn gửi đến cậu những lời chúc thật chân thành. Mong cậu luôn có thật nhiều sức khoẻ để theo đuổi những điều cậu yêu thích, thật nhiều niềm vui để mỗi ngày đều trở nên ý nghĩa.\n\nHy vọng tuổi mới sẽ mang đến những cơ hội mới, những khoảnh khắc hạnh phúc bên những người cậu trân trọng. Chúc mừng sinh nhật! 🎂✨';

  // --- S4 State ---
  const [holdPct, setHoldPct] = useState(0);
  const [ssPos, setSsPos] = useState({ x: 0, y: 0, rot: 0, display: 'none' });
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ssRafRef = useRef<number | null>(null);

  // --- View Modes (Float, Sphere, Grid) ---
  const [viewMode, setViewMode] = useState<string>(''); // '', 'float', 'sphere', 'grid'

  // Modal
  const [modalSrc, setModalSrc] = useState<string>('');

  // S4 logic
  const W = useRef(typeof window !== 'undefined' ? window.innerWidth : 1000);
  const H = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);

  // ========== STARFIELD BG ==========
  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    let stars: any[] = [];
    let sts: any[] = [];
    let animationFrameId: number;

    const mkSS = () => {
      if (Math.random() > 0.4) return;
      sts.push({
        x: Math.random() * W.current * 0.8,
        y: Math.random() * H.current * 0.3,
        vx: Math.random() * 8 + 4,
        vy: Math.random() * 4 + 2,
        life: 1,
        tail: []
      });
    };

    const drawStar4 = (cx: number, cy: number, r: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        const ri = k % 2 === 0 ? r * 2 : r * 0.7;
        ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const animBG = () => {
      ctx.clearRect(0, 0, W.current, H.current);
      // background stars
      for (const s of stars) {
        s.a += s.da;
        if (s.a < 0 || s.a > 1) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,220,50,.75)';
      for (let i = 0; i < 6; i++) {
        const s = stars[i * 28];
        if (s) drawStar4(s.x, s.y, 3.5);
      }
      // shooting stars
      for (let i = sts.length - 1; i >= 0; i--) {
        const ss = sts[i];
        ss.tail.push({ x: ss.x, y: ss.y, a: ss.life });
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.018;
        ss.tail = ss.tail.slice(-22);
        ss.tail.forEach((p: any, j: number) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4 * (j / ss.tail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.a * (j / ss.tail.length)})`;
          ctx.fill();
        });
        if (ss.life <= 0) sts.splice(i, 1);
      }
      animationFrameId = requestAnimationFrame(animBG);
    };

    const resize = () => {
      W.current = cvs.width = window.innerWidth;
      H.current = cvs.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * W.current,
          y: Math.random() * H.current,
          r: Math.random() * 1.6 + 0.3,
          a: Math.random(),
          da: Math.random() * 0.018 - 0.009
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animBG();
    const interval = setInterval(mkSS, 950);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, []);

  // --- S1 Actions ---
  const handleGiftClick = () => {
    // We would fire some shooting stars here if we wanted, but we'll just transition to scene 2
    setScene(2);
  };

  // --- S2 Actions ---
  useEffect(() => {
    if (scene === 2 && !s2Ready) {
      setS2Ready(true);
      setTimeout(() => setS2Words(prev => ({ ...prev, happy: true })), 120);
      setTimeout(() => setS2Words(prev => ({ ...prev, bday: true })), 180);
      setTimeout(() => setHatVisible(true), 300);
      
      [0, 1, 2].forEach(i => {
        setTimeout(() => {
          setScrollItemsVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 540 + i * 320);
      });

      setTimeout(() => setBtnLetterVisible(true), 1620);
    }
  }, [scene, s2Ready]);

  // --- S3 Actions ---
  useEffect(() => {
    if (scene === 3 && !s3Ready) {
      setS3Ready(true);
      const msgArr = Array.from(cardMsg);
      setCardMsgVisible(new Array(msgArr.length).fill(false));
      
      for (let i = 0; i < msgArr.length; i++) {
        setTimeout(() => {
          setCardMsgVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, i * 20);
      }

      setTimeout(() => setBtnStartVisible(true), msgArr.length * 20 + 300);
      
      // We can also fire gentle fireworks here, but simplified for React port
    }
  }, [scene, s3Ready]);

  // --- S4 Actions ---
  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSsPos({ x: 0, y: 0, rot: 0, display: 'block' });
    let sx = -60, sy = H.current * 0.1, vx = W.current / 55, vy = H.current / 110;
    
    let currentPct = 0;

    const moveStar = () => {
      sx += vx;
      sy += vy;
      if (sx > W.current + 60) {
        sx = -60;
        sy = Math.random() * H.current * 0.3;
        vy = H.current / 110 + (Math.random() - 0.5) * 2;
      }
      setSsPos({ x: sx, y: sy, rot: Math.atan2(vy, vx) * 180 / Math.PI + 90, display: 'block' });
      ssRafRef.current = requestAnimationFrame(moveStar);
    };
    ssRafRef.current = requestAnimationFrame(moveStar);

    holdTimerRef.current = setInterval(() => {
      currentPct += 1.5;
      setHoldPct(currentPct);
      if (currentPct >= 100) {
        clearInterval(holdTimerRef.current!);
        cancelAnimationFrame(ssRafRef.current!);
        setSsPos(p => ({ ...p, display: 'none' }));
        setHoldPct(0);
        setScene(-1); // go out of scenes
        setViewMode('float'); // move to float mode
      }
    }, 30);
  };

  const endHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (ssRafRef.current) cancelAnimationFrame(ssRafRef.current);
    setSsPos(p => ({ ...p, display: 'none' }));
    setHoldPct(0);
  };

  const fireEmoji = (e: React.MouseEvent, ch: string) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const rect = btn.getBoundingClientRect();
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('div');
      p.className = 'float-emoji';
      p.textContent = ch;
      p.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
      p.style.top = rect.top + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  };

  return (
    <>
      <canvas ref={cvsRef} id="bg" />

      {/* S1 */}
      <div id="s1" className={`scene ${scene === 1 ? 'active' : ''}`}>
        <span className="gift" id="gift-btn" onClick={handleGiftClick}>🎁</span>
        <p>Đây là món quà tặng em</p>
      </div>

      {/* S2 */}
      <div id="s2" className={`scene ${scene === 2 ? 'active' : ''}`}>
        <div className="s2-left">
          <div className="hb-line" id="hb-happy">
            {"Happy".split('').map((c, i) => <span key={i} className={s2Words.happy ? 'show' : ''}>{c}</span>)}
          </div>
          <div className="hb-line" id="hb-bday">
            {"Birthday".split('').map((c, i) => <span key={i} className={s2Words.bday ? 'show' : ''}>{c}</span>)}
          </div>
          <div className="date-pill">29-02</div>
          <div className="rabbit">🐰</div>
          <div className="scroll-col" id="scroll-col">
            {['🎂 Matsumoto Reiyo', '🌸 Chúc em tuổi mới', '☀️ Luôn hạnh phúc'].map((t, i) => (
              <div key={i} className={`si ${scrollItemsVisible[i] ? 'show' : ''}`}>{t}</div>
            ))}
          </div>
          <button 
            className="btn-letter" 
            style={{ display: btnLetterVisible ? 'block' : 'none' }}
            onClick={() => setScene(3)}
          >
            Mở thư 💌
          </button>
        </div>
        <div className="s2-right">
          <div className="balloons">
            <div className="bl b1"></div><div className="bl b3"></div><div className="bl b2"></div><div className="bl b4"></div><div className="bl b5"></div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className={`hat ${hatVisible ? 'show' : ''}`} id="hat">🎩</div>
            <div className="photo-circle">
              <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="" />
            </div>
          </div>
          <div className="name-tag">Matsumoto Reiyo</div>
        </div>
      </div>

      {/* S3 */}
      <div id="s3" className={`scene ${scene === 3 ? 'active' : ''}`}>
        <div className="cb-wrap">
          <div className="card">
            <h2>Happy Birthday</h2>
            <p className="card-text" id="card-text">
              {Array.from(cardMsg).map((c, i) => {
                if (c === '\n') return <br key={i} />;
                return <span key={i} className={cardMsgVisible[i] ? 'show' : ''}>{c}</span>;
              })}
            </p>
            <div className="bear">🐻</div>
          </div>
        </div>
        <button 
          className={`btn-start ${btnStartVisible ? 'show' : ''}`} 
          onClick={() => setScene(4)}
        >
          Start
        </button>
      </div>

      {/* S4 */}
      <div id="s4" className={`scene ${scene === 4 ? 'active' : ''}`}>
        <div 
          id="s4-hold"
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
        >
          <div style={{ fontSize: '3.2rem' }}>🌠</div>
          <div className="prog-wrap">
            <div className="prog-fill" id="prog-fill" style={{ width: `${holdPct}%` }}></div>
          </div>
          <p className="blink">Nhấn &amp; Giữ để mở ảnh</p>
        </div>
      </div>
      <div 
        id="shoot-star" 
        style={{ 
          display: ssPos.display, 
          left: ssPos.x, top: ssPos.y, 
          transform: `rotate(${ssPos.rot}deg)` 
        }} 
      />

      {/* MODE A: Float */}
      <FloatMode active={viewMode === 'float'} onImgClick={setModalSrc} onGlobeClick={() => setViewMode('sphere')} />

      {/* MODE B: Sphere */}
      <SphereMode active={viewMode === 'sphere'} onImgClick={setModalSrc} />

      {/* MODE C: Grid */}
      <div id="mode-grid" className={viewMode === 'grid' ? 'active' : ''}>
        {viewMode === 'grid' && imgSrcs.map((src, i) => (
          <img 
            key={i} 
            src={src} 
            alt="" 
            style={{ animationDelay: `${i * 45}ms` }}
            onClick={() => setModalSrc(src)}
          />
        ))}
      </div>

      {/* View Switch Bar */}
      <div id="view-bar" className={viewMode ? 'show' : ''}>
        <button className={`vbtn ${viewMode === 'float' ? 'active' : ''}`} onClick={() => setViewMode('float')}>🪄 Float</button>
        <button className={`vbtn ${viewMode === 'sphere' ? 'active' : ''}`} onClick={() => setViewMode('sphere')}>🌐 Cầu 3D</button>
        <button className={`vbtn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>🖼 Lưới</button>
      </div>

      {/* Modal */}
      <div className={`modal-bg ${modalSrc ? 'open' : ''}`} id="modal" onClick={(e) => { if (e.target === e.currentTarget) setModalSrc(''); }}>
        {modalSrc && (
          <>
            <div className="modal-inner">
              <div className="mcls" onClick={() => setModalSrc('')}>✕</div>
              <img id="modal-img" src={modalSrc} alt="" />
            </div>
            <div className="emoji-row">
              <button onClick={(e) => fireEmoji(e, '❤️')}>❤️</button>
              <button onClick={(e) => fireEmoji(e, '🎉')}>🎉</button>
              <button onClick={(e) => fireEmoji(e, '✨')}>✨</button>
              <button onClick={(e) => fireEmoji(e, '🌸')}>🌸</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ==========================================
// Float Mode Component
// ==========================================
function FloatMode({ active, onImgClick, onGlobeClick }: { active: boolean, onImgClick: (s:string)=>void, onGlobeClick: ()=>void }) {
  const [cards, setCards] = useState<any[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (active && !initialized.current) {
      initialized.current = true;
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      const newCards = imgSrcs.map((src, i) => {
        const w = 110 + Math.random() * 60;
        const h = w * 1.28;
        const startX = Math.random() * (W - w);
        const startY = Math.random() * -300 - h;
        const targetY = 50 + Math.random() * (H - h - 80);
        const rot = (Math.random() - 0.5) * 22;
        return { id: i, src, w, h, x: startX, y: startY, targetY, rot, delay: i * 120 };
      });
      setCards(newCards);
    }
  }, [active]);

  return (
    <div id="mode-float" className={active ? 'active' : ''}>
      {cards.map(c => (
        <FloatCard key={c.id} card={c} onImgClick={onImgClick} />
      ))}
      <div id="globe-btn" onClick={onGlobeClick} style={{ display: initialized.current ? 'flex' : 'none', opacity: active ? 1 : 0 }}>🌐</div>
    </div>
  );
}

function FloatCard({ card, onImgClick }: { card: any, onImgClick: (s:string)=>void }) {
  const [style, setStyle] = useState({
    width: card.w, height: card.h, left: card.x, top: card.y, transform: `rotate(${card.rot}deg)`,
    opacity: 0, transition: 'none'
  });

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStyle(prev => ({ ...prev, transition: 'top 1.2s cubic-bezier(.22,.68,0,1.2), opacity .6s', opacity: 1, top: typeof window !== 'undefined' ? window.innerHeight + 50 : 800 }));
      const t2 = setTimeout(() => {
        setStyle(prev => ({ ...prev, top: card.targetY }));
        const t3 = setTimeout(() => {
          // simple continuous float using animation would be better via CSS but we use state here roughly or just skip continuous float to not kill React rendering rate
          // we will rely on CSS animation in globals for it
          setStyle(prev => ({ ...prev, transform: `rotate(${card.rot}deg)`})); 
        }, 1300);
        return () => clearTimeout(t3);
      }, 50);
      return () => clearTimeout(t2);
    }, card.delay);
    return () => clearTimeout(t1);
  }, [card]);

  return (
    <div className="fcard" style={style as React.CSSProperties} onClick={() => onImgClick(card.src)}>
      <img src={card.src} alt="" />
    </div>
  );
}


// ==========================================
// Sphere Mode Component (Quaternion rotation)
// ==========================================
function SphereMode({ active, onImgClick }: { active: boolean, onImgClick: (s:string)=>void }) {
  const [q, setQ] = useState({ x: 0, y: 0, z: 0, w: 1 });
  const qRef = useRef({ x: 0, y: 0, z: 0, w: 1 });
  const vel = useRef({ x: 0.009, y: 0 });
  const sR = useRef(260);
  const RMIN = 150, RMAX = 400;
  const isDrag = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const inRaf = useRef<number | null>(null);

  const initQ = () => {
    const ang = -0.18;
    const ax = 1, ay = 0, az = 0;
    const s = Math.sin(ang / 2);
    qRef.current = { x: ax * s, y: ay * s, z: az * s, w: Math.cos(ang / 2) };
    setQ({ ...qRef.current });
  };

  useEffect(() => {
    if (active) {
      if (qRef.current.w === 1 && qRef.current.x === 0 && qRef.current.y === 0 && qRef.current.z === 0) {
        initQ();
      }
      const inertia = () => {
        if (isDrag.current) return;
        const spd = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);
        if (spd < 0.00002) return;
        const ax = -vel.current.y / spd, ay = vel.current.x / spd;
        
        const sang = Math.sin(spd / 2);
        const qm = { x: ax * sang, y: ay * sang, z: 0, w: Math.cos(spd / 2) };
        const a = qm, b = qRef.current;
        const newQ = {
          x: a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
          y: a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
          z: a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w,
          w: a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z
        };
        qRef.current = newQ;
        setQ(newQ);
        vel.current.x *= 0.95;
        vel.current.y *= 0.95;
        inRaf.current = requestAnimationFrame(inertia);
      };
      inRaf.current = requestAnimationFrame(inertia);
    } else {
      if (inRaf.current) cancelAnimationFrame(inRaf.current);
    }
    return () => { if (inRaf.current) cancelAnimationFrame(inRaf.current); };
  }, [active]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'IMG') return;
    isDrag.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    vel.current = { x: 0, y: 0 };
    if (inRaf.current) cancelAnimationFrame(inRaf.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrag.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    
    const d = Math.sqrt(dx*dx + dy*dy);
    const ang = d * 0.007;
    if (!ang) return;
    const ax = -dy / d, ay = dx / d;
    const sang = Math.sin(ang / 2);
    const qm = { x: ax * sang, y: ay * sang, z: 0, w: Math.cos(ang / 2) };
    const a = qm, b = qRef.current;
    
    qRef.current = {
      x: a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
      y: a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
      z: a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w,
      w: a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z
    };
    setQ({ ...qRef.current });
    vel.current = { x: dx * 0.007, y: dy * 0.007 };
  };

  const onPointerUp = () => {
    isDrag.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    sR.current = Math.min(RMAX, Math.max(RMIN, sR.current + e.deltaY * 0.35));
    // Hack wrapper size to force re-render if needed
    setQ(prev => ({...prev}));
  };

  // Build matrix
  const { x, y, z, w } = q;
  const mat = [1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), 0,  2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), 0,  2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), 0,  0, 0, 0, 1];
  
  // Create static scene layout
  const nodes = useMemo(() => {
    let idx = 0;
    const arr: any[] = [];
    RINGS.forEach(ring => {
      for (let j = 0; j < ring.count; j++) {
        const lonDeg = (j / ring.count) * 360;
        if (idx < imgSrcs.length) {
            arr.push({ idx, ring, lonDeg });
            idx++;
        }
      }
    });
    return arr;
  }, []);

  return (
    <div 
      id="mode-sphere" 
      className={`${active ? 'active' : ''} ${isDrag.current ? 'dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <div id="sphere-scene" style={{ transform: `translate(-50%, -50%) matrix3d(${mat.join(',')})` }}>
        {nodes.map(n => (
          <img 
            key={n.idx} 
            src={imgSrcs[n.idx % imgSrcs.length]} 
            draggable={false}
            onClick={() => onImgClick(imgSrcs[n.idx % imgSrcs.length])}
            style={{
              transform: `rotateY(${n.lonDeg}deg) rotateX(${-n.ring.lat}deg) translateZ(${sR.current}px)`,
              width: `${n.ring.w}px`, height: `${n.ring.h}px`,
              left: `-${n.ring.w / 2}px`, top: `-${n.ring.h / 2}px`
            }}
            alt="" 
          />
        ))}
      </div>
      <div className="drag-hint" id="drag-hint">🖱 Kéo để xoay • Scroll để zoom</div>
    </div>
  );
}
