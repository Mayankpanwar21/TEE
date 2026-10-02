import { useMemo, useState } from "react";
import {
  Home, BarChart3, LayoutDashboard, Plus, ArrowUpRight, ArrowDownRight,
  Settings, LifeBuoy, Moon, Sun, Star, ChevronDown, Search, Newspaper,
  Activity, ShoppingCart, X
} from "lucide-react";

const symbols = [
  { symbol: "NQ", name: "Nasdaq 100", price: "25,184.25", change: "+0.72%" },
  { symbol: "ES", name: "S&P 500", price: "6,721.50", change: "+0.41%" },
  { symbol: "YM", name: "Dow Jones", price: "46,812", change: "-0.18%" },
  { symbol: "AAPL", name: "Apple", price: "255.90", change: "+1.12%" },
  { symbol: "TSLA", name: "Tesla", price: "431.20", change: "-0.63%" },
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
              <button className="execute">Demo {side}</button>
            </div>
            <div className="chart">
              <div className="price-line">{money(selectedData.price)}</div>
              <div className="candles">{Array.from({length:42},(_,i)=><div key={i} className={i%3===0||i%5===0?"candle down":"candle"} style={{height:(35+(i*17)%105)+"px", marginTop:(120-(i*11)%80)+"px"}}><i/></div>)}</div>
              <div className="chart-grid"/></div>
          </div>

          <div className="panel activity">
            <div className="panel-head"><h3><Activity size={16}/> Trader Activity</h3></div>
            <div className="activity-tabs">{["Open Positions","Closed Positions","Open Orders","Executions","Today's Orders"].map(t=><button key={t} className={activeTab===t?"active":""} onClick={()=>setActiveTab(t)}>{t}</button>)}</div>
            <div className="empty-state"><ShoppingCart size={20}/><span>No {activeTab.toLowerCase()} yet</span></div>
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
            <button className={side==="BUY"?"primary-buy":"primary-sell"}>{side} {selected}</button>
          </div>

          <div className="panel metrics">
            <div className="panel-head"><h3>Daily Metrics</h3><span>Today</span></div>
            <Metric label="Profit Target" value="$1,284 / $2,500" progress="51%"/>
            <Metric label="Daily Loss Remaining" value="$1,716"/>
            <Metric label="Max Loss Remaining" value="$4,716"/>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({label,value,progress}) {
  return <div className="metric"><div><span>{label}</span><b>{value}</b></div>{progress && <div className="progress"><i style={{width:progress}}/></div>}</div>
}

export default App;
