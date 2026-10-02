import { useMemo, useState } from "react";
import {
  Home, BarChart3, LayoutDashboard, Plus, ArrowUpRight, ArrowDownRight,
  Settings, LifeBuoy, Moon, Sun, Star, ChevronDown, Search, Newspaper,
  Activity, ShoppingCart, X
} from "lucide-react";

const symbols = [
  { symbol: "NQ", name: "Nasdaq 100", price: 25184.25, change: "+0.72%" },
  { symbol: "ES", name: "S&P 500", price: 6721.5, change: "+0.41%" },
  { symbol: "YM", name: "Dow Jones", price: 46812, change: "-0.18%" },
  { symbol: "AAPL", name: "Apple", price: 255.9, change: "+1.12%" },
  { symbol: "TSLA", name: "Tesla", price: 431.2, change: "-0.63%" },
];

function App() {
  const [dark, setDark] = useState(true);
  const [selected, setSelected] = useState("NQ");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("Market");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("Open Positions");
  const [watchlists, setWatchlists] = useState({ Default: symbols.map(s => s.symbol) });
  const [activeWatchlist, setActiveWatchlist] = useState("Default");
  const [showLists, setShowLists] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [bpPercent, setBpPercent] = useState(50);
  const [positions, setPositions] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);
  const [tpSlPopup, setTpSlPopup] = useState(null);

  const selectedData = symbols.find(s => s.symbol === selected) || symbols[0];
  const currentSymbols = watchlists[activeWatchlist] || [];
  const visibleSymbols = useMemo(() => currentSymbols
    .map(code => symbols.find(s => s.symbol === code))
    .filter(Boolean)
    .filter(s => (s.symbol + " " + s.name).toLowerCase().includes(search.toLowerCase())), [currentSymbols, search]);
  const shownSymbols = activeWatchlist === "Favourites" ? visibleSymbols.filter(s => favorites.has(s.symbol)) : visibleSymbols;
  const calculatedQty = Math.max(1, Math.floor((100000 * bpPercent / 100) / selectedData.price));
  const selectedPositions = positions.filter(p => p.symbol === selected);
  const openPnl = positions.reduce((sum, p) => sum + ((selectedData.price - p.entry) * (p.side === "BUY" ? 1 : -1) * Number(p.qty)), 0);
  const money = n => Number(n).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
  const selectSymbol = symbol => { setSelected(symbol); setExpanded(symbol); };
  const toggleFavorite = symbol => setFavorites(prev => { const next = new Set(prev); next.has(symbol) ? next.delete(symbol) : next.add(symbol); return next; });
  const addWatchlist = () => { const name = window.prompt("Watchlist name"); if (!name?.trim() || watchlists[name.trim()]) return; setWatchlists(prev => ({...prev, [name.trim()]: []})); setActiveWatchlist(name.trim()); };
  const addSymbol = () => { const code = window.prompt("Enter symbol: NQ, ES, YM, AAPL or TSLA"); const match = symbols.find(s => s.symbol.toLowerCase() === code?.trim().toLowerCase()); if (!match || currentSymbols.includes(match.symbol)) return; setWatchlists(prev => ({...prev, [activeWatchlist]: [...prev[activeWatchlist], match.symbol]})); };
  const executeDemoOrder = () => {
    const amount = Math.max(1, Number(qty) || 1);
    const price = Number(selectedData.price);
    if (orderType === "Market") {
      const position = { id: Date.now(), symbol: selected, side, qty: amount, entry: price, tp: null, sl: null };
      setPositions(prev => [...prev, position]);
      setActiveTab("Open Positions");
    } else {
      const order = { id: Date.now(), symbol: selected, side, type: orderType, qty: amount, price };
      setOpenOrders(prev => [...prev, order]);
      setActiveTab("Open Orders");
    }
  };
  const closePosition = id => {
    setPositions(prev => {
      const found = prev.find(p => p.id === id);
      if (found) setClosedPositions(closed => [...closed, { ...found, exit: Number(symbols.find(s => s.symbol === found.symbol)?.price || found.entry), closedAt: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}) }]);
      return prev.filter(p => p.id !== id);
    });
  };
  const openTpSlPopup = (position, type) => setTpSlPopup({ position, type, value: position[type.toLowerCase()] ?? "" });
  const saveTpSl = () => {
    if (!tpSlPopup) return;
    const value = Number(tpSlPopup.value);
    if (!Number.isFinite(value) || value <= 0) return;
    const field = tpSlPopup.type.toLowerCase();
    setPositions(prev => prev.map(p => p.id === tpSlPopup.position.id ? { ...p, [field]: value } : p));
    setTpSlPopup(null);
  };
  const cancelOpenOrder = id => setOpenOrders(prev => prev.filter(o => o.id !== id));

  return (
    <div className={dark ? "app dark" : "app"}>
      <header className="topbar">
        <div className="brand"><div className="brand-mark">TEE</div><span>TheEntryExit</span></div>
        <div className="account-stats">
          <div><small>Buying Power</small><strong>$100,000.00</strong></div>
          <div><small>BP Used</small><strong>$12,450.00</strong></div>
          <div><small>Open P&L</small><strong className="positive">+$428.50</strong></div>
          <div><small>Closed P&L</small><strong>+$1,284.25</strong></div>
          <button className="account">Demo Account <ChevronDown size={15}/></button>
          <button className="icon-btn" onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
      </header>

      <aside className="sidebar">
        {[Home, BarChart3, LayoutDashboard].map((Icon, i) => (
          <button className={i === 2 ? "nav-btn active" : "nav-btn"} key={i}><Icon size={20}/></button>
        ))}
        <button className="nav-btn add"><Plus size={20}/></button>
        <div className="sidebar-spacer"/>
        <button className="nav-btn"><ArrowUpRight size={20}/></button>
        <button className="nav-btn"><LifeBuoy size={20}/></button>
        <button className="nav-btn"><Settings size={20}/></button>
      </aside>

      <main className="workspace">
        <section className="left-col">
          <div className="panel watchlist">
            <div className="panel-head"><div><h3>Watchlist</h3><span>{activeWatchlist}</span></div><button className="mini-btn" onClick={addWatchlist}>+ New</button></div>
            <div className="watch-tabs">
              <button className={activeWatchlist === "Default" ? "selected" : ""} onClick={() => setActiveWatchlist("Default")}>Default</button>
              <button className={activeWatchlist === "Favourites" ? "selected" : ""} onClick={() => setActiveWatchlist("Favourites")}>★ Favourites</button>
              <button className="watchlist-menu-btn" onClick={() => setShowLists(!showLists)}><ChevronDown size={13}/></button>
            </div>
            {showLists && <div className="watchlist-menu">{Object.keys(watchlists).map(name => <button key={name} onClick={() => {setActiveWatchlist(name);setShowLists(false)}}>{name}</button>)}<button onClick={addWatchlist}>＋ Create watchlist</button></div>}
            <div className="search"><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symbol"/></div>
            {shownSymbols.map(s => (
              <div key={s.symbol} className="watch-symbol-wrap">
                <div className={selected === s.symbol ? "symbol-row selected-row" : "symbol-row"} onClick={() => selectSymbol(s.symbol)}>
                  <span className="symbol-icon">{s.symbol.slice(0,1)}</span>
                  <span className="symbol-name"><b>{s.symbol}</b><small>{s.name}</small></span>
                  <span className="symbol-price"><b>{money(s.price)}</b><small className={s.change.startsWith("+") ? "positive" : "negative"}>{s.change}</small></span>
                  <button className={"star-button " + (favorites.has(s.symbol) ? "favorite" : "")} onClick={e => {e.stopPropagation();toggleFavorite(s.symbol)}}><Star size={14} fill={favorites.has(s.symbol) ? "currentColor" : "none"}/></button>
                  <button className="row-expand" onClick={e => {e.stopPropagation();setSelected(s.symbol);setExpanded(expanded === s.symbol ? null : s.symbol)}}><ChevronDown size={14}/></button>
                </div>
                {expanded === s.symbol && <div className="watch-actions">
                  <div className="watch-action-top"><button className="watch-buy" onClick={() => {setSelected(s.symbol);setSide("BUY")}}>BUY</button><button className="watch-sell" onClick={() => {setSelected(s.symbol);setSide("SELL")}}>SELL</button><label>Qty<input type="number" min="1" value={selected === s.symbol ? qty : 1} onChange={e => {setSelected(s.symbol);setQty(e.target.value)}}/></label></div>
                  <div className="watch-bp"><div><span>Buying Power</span><b>{bpPercent}%</b></div><input type="range" min="1" max="100" value={bpPercent} onChange={e => setBpPercent(Number(e.target.value))}/><small>{calculatedQty} units using {bpPercent}% of available buying power</small></div>
                  <div className="watch-actions-buttons"><button onClick={() => setQty(calculatedQty)}>Use {calculatedQty} Qty</button><button onClick={() => {setQty(calculatedQty);setSide("BUY")}}>Quick Buy</button><button onClick={() => {setQty(calculatedQty);setSide("SELL")}}>Quick Sell</button></div>
                </div>}
              </div>
            ))}
            <button className="add-symbol" onClick={addSymbol}>+ Add symbol</button>
          </div>

          <div className="panel news">
            <div className="panel-head"><h3><Newspaper size={16}/> Latest News</h3><span>View all</span></div>
            {["US stocks edge higher before jobs data", "Tech shares lead another market session", "Fed officials signal patience on rates"].map((n,i) =>
              <div className="news-item" key={i}><b>{n}</b><small>MarketWire · {i+1}h ago</small></div>
            )}
          </div>
        </section>

        <section className="center-col">
          <div className="panel chart-panel">
            <div className="chart-toolbar">
              <div className="chart-symbol"><span className="symbol-icon">N</span><div><b>{selected}</b><small> · Demo Market</small></div><ChevronDown size={14}/></div>
              <div className="timeframes"><button>1m</button><button className="active">5m</button><button>15m</button><button>1H</button><button>1D</button></div>
              <div className="chart-actions"><button>Indicators</button><button>Draw</button></div>
            </div>
            <div className="trade-toolbar">
              <div className="trade-toggle"><button className={side==="BUY"?"buy active": "buy"} onClick={()=>setSide("BUY")}>Buy</button><button className={side==="SELL"?"sell active":"sell"} onClick={()=>setSide("SELL")}>Sell</button></div>
              <label>Qty <input type="number" value={qty} min="1" onChange={e=>setQty(e.target.value)}/></label>
              <select value={orderType} onChange={e=>setOrderType(e.target.value)}><option>Market</option><option>Limit</option><option>Stop</option></select>
              <button className="execute" onClick={executeDemoOrder}>Demo {side}</button>
            </div>
            <div className="chart">
              <div className="price-line">{money(selectedData.price)}</div>
              {selectedPositions.length > 0 && <div className="chart-position-strip">
                {selectedPositions.map(p => <div className="chart-position" key={p.id}>
                  <span className={p.side === "BUY" ? "position-side buy-text" : "position-side sell-text"}>{p.side}</span>
                  <span>{p.qty} @ {money(p.entry)}</span>
                  <button onClick={() => openTpSlPopup(p, "TP")}>TP{p.tp ? ` ${money(p.tp)}` : ""}</button>
                  <button onClick={() => openTpSlPopup(p, "SL")}>SL{p.sl ? ` ${money(p.sl)}` : ""}</button>
                  <button className="close-position" onClick={() => closePosition(p.id)}>Close</button>
                </div>)}
              </div>}
              <div className="candles">{Array.from({length:42},(_,i)=><div key={i} className={i%3===0||i%5===0?"candle down":"candle"} style={{height:(35+(i*17)%105)+"px", marginTop:(120-(i*11)%80)+"px"}}><i/></div>)}</div>
              <div className="chart-markers">
                {selectedPositions.map(p => <div className="entry-marker" key={p.id} style={{left:"46%"}}><span>{p.side} {p.qty}</span><i/></div>)}
              </div>
              <div className="chart-grid"/></div>
          </div>

          <div className="panel activity">
            <div className="panel-head"><h3><Activity size={16}/> Trader Activity</h3></div>
            <div className="activity-tabs">{["Open Positions","Closed Positions","Open Orders","Executions","Today's Orders"].map(t=><button key={t} className={activeTab===t?"active":""} onClick={()=>setActiveTab(t)}>{t}</button>)}</div>
            <div className="activity-content">
              {activeTab === "Open Positions" && (positions.length ? positions.map(p => <div className="activity-row" key={p.id}>
                <div><b className={p.side === "BUY" ? "buy-text" : "sell-text"}>{p.side}</b><strong>{p.symbol}</strong><small>{p.qty} units · Entry {money(p.entry)}</small></div>
                <div className="activity-price"><b>{money((symbols.find(s=>s.symbol===p.symbol)?.price || p.entry))}</b><small className={((symbols.find(s=>s.symbol===p.symbol)?.price || p.entry) - p.entry) * (p.side === "BUY" ? 1 : -1) >= 0 ? "positive" : "negative"}>P&L {money(((symbols.find(s=>s.symbol===p.symbol)?.price || p.entry) - p.entry) * (p.side === "BUY" ? 1 : -1) * p.qty)}</small></div>
                <div className="activity-actions"><button onClick={() => openTpSlPopup(p,"TP")}>TP</button><button onClick={() => openTpSlPopup(p,"SL")}>SL</button><button className="close-mini" onClick={() => closePosition(p.id)}>Close</button></div>
              </div>) : <div className="empty-state"><ShoppingCart size={20}/><span>No open positions yet</span></div>)}
              {activeTab === "Open Orders" && (openOrders.length ? openOrders.map(o => <div className="activity-row" key={o.id}>
                <div><b>{o.side}</b><strong>{o.symbol}</strong><small>{o.type} · {o.qty} units</small></div><div className="activity-price"><b>{money(o.price)}</b></div><div className="activity-actions"><button onClick={() => cancelOpenOrder(o.id)}>Cancel</button></div>
              </div>) : <div className="empty-state"><ShoppingCart size={20}/><span>No open orders yet</span></div>)}
              {activeTab === "Closed Positions" && (closedPositions.length ? closedPositions.map(p => <div className="activity-row" key={p.id}><div><b>{p.side}</b><strong>{p.symbol}</strong><small>{p.qty} units · {p.closedAt}</small></div><div className="activity-price"><b>Entry {money(p.entry)}</b><small>Exit {money(p.exit)}</small></div></div>) : <div className="empty-state"><ShoppingCart size={20}/><span>No closed positions yet</span></div>)}
              {(activeTab === "Executions" || activeTab === "Today's Orders") && <div className="empty-state"><ShoppingCart size={20}/><span>No {activeTab.toLowerCase()} yet</span></div>}
            </div>
          </div>
        </section>

        <section className="right-col">
          <div className="panel order-panel">
            <div className="panel-head"><div><h3>{selected}</h3><span>Order Window</span></div><button className="icon-btn"><X size={16}/></button></div>
            <div className="big-quote"><strong>{money(selectedData.price)}</strong><span className={selectedData.change.startsWith("+") ? "positive" : "negative"}>{selectedData.change}</span></div>
            <div className="buy-sell"><button className={side==="BUY"?"active-buy":""} onClick={()=>setSide("BUY")}>BUY</button><button className={side==="SELL"?"active-sell":""} onClick={()=>setSide("SELL")}>SELL</button></div>
            <label>Order Type<select value={orderType} onChange={e=>setOrderType(e.target.value)}><option>Market</option><option>Limit</option><option>Stop</option></select></label>
            <label>Quantity<input type="number" value={qty} min="1" onChange={e=>setQty(e.target.value)}/></label>
            <div className="slider-row"><span>Buying Power</span><b>50%</b></div><input type="range" defaultValue="50"/>
            <div className="two-col"><label>Take Profit<input placeholder="Optional"/></label><label>Stop Loss<input placeholder="Optional"/></label></div>
            <button className={side==="BUY"?"primary-buy":"primary-sell"} onClick={executeDemoOrder}>{side} {selected}</button>
          </div>

          <div className="panel metrics">
            <div className="panel-head"><h3>Daily Metrics</h3><span>Today</span></div>
            <Metric label="Profit Target" value="$1,284 / $2,500" progress="51%"/>
            <Metric label="Daily Loss Remaining" value="$1,716"/>
            <Metric label="Max Loss Remaining" value="$4,716"/>
          </div>
        </section>
      </main>
      {tpSlPopup && <div className="modal-backdrop" onClick={() => setTpSlPopup(null)}>
        <div className="tp-sl-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-head"><div><b>Add {tpSlPopup.type}</b><small>{tpSlPopup.position.side} {tpSlPopup.position.qty} {tpSlPopup.position.symbol}</small></div><button className="icon-btn" onClick={() => setTpSlPopup(null)}><X size={15}/></button></div>
          <p>{tpSlPopup.type === "TP" ? (tpSlPopup.position.side === "BUY" ? "This will create a Sell Limit for the same position and quantity." : "This will create a Buy Limit for the same position and quantity.") : (tpSlPopup.position.side === "BUY" ? "This will create a Sell Stop for the same position and quantity." : "This will create a Buy Stop for the same position and quantity.")}</p>
          <label>Price<input autoFocus type="number" step="0.01" value={tpSlPopup.value} onChange={e => setTpSlPopup({...tpSlPopup, value:e.target.value})} placeholder={money(selectedData.price)}/></label>
          <button className="modal-save" onClick={saveTpSl}>Save {tpSlPopup.type}</button>
        </div>
      </div>}
    </div>
  );
}

function Metric({label,value,progress}) {
  return <div className="metric"><div><span>{label}</span><b>{value}</b></div>{progress && <div className="progress"><i style={{width:progress}}/></div>}</div>
}

export default App;
