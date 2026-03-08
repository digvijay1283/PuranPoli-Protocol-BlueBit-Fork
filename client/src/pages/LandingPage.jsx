import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="cod-landing font-sans antialiased text-brand-dark bg-white overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-brand-purple/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-brand-dark/10">
        <div className="flex items-center gap-8">
          <div className="text-3xl font-black tracking-tighter">COD</div>
          <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest">
            <a className="hover:underline" href="#solution">Our Solution</a>
            <a className="hover:underline" href="#how">How It Works</a>
            <a className="hover:underline" href="#pricing">Plans</a>
            <a className="hover:underline" href="#blog">Use Cases</a>
            <a className="hover:underline" href="#faqs">FAQs</a>
          </div>
        </div>
        <a className="bg-brand-green border-2 border-brand-dark px-6 py-2 rounded-full font-bold text-sm uppercase transition hover:scale-105" href="#pricing">
          Start Planning
        </a>
      </nav>

      <section className="pt-32 pb-20 px-6 bg-brand-purple relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-40 left-10 md:left-20 w-32 h-32 floating" style={{ animationDelay: "0s" }}>
          <img
            alt="Hello sticker"
            className="rounded-full border-2 border-brand-dark shadow-lg rotate-[-12deg]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa12MT99PsjeSLl65aoN_djkzaGiJd8RlevsoRv5bGzEaLJlX4Rjfu5hPpUwErXQ4PQpcnAbHRw-gaar93TU4qZjax8gqaEbZ_ABJuYbxRg4B5NMlRY5hsx2vjmb4QOEjLEgswGCTGGg0ynrofSdpQPQTT92HIkh5A2f8fjP0n4umw8oPXuVWKX64x8FHjVCUbZ_wrakpxnzngqHo82NeM8vfm7xnUH55l3QiX8ZVhpn3cu_Ra-YUAZK8dT2MfxDZXX7IA7Syy9w"
          />
        </div>
        <div className="absolute bottom-40 right-10 md:right-20 w-40 h-40 floating" style={{ animationDelay: "1s" }}>
          <img
            alt="Smile sticker"
            className="rounded-full border-2 border-brand-dark shadow-lg rotate-[15deg]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqxX6jf_ZkErWwlywedbGgc00Ooofg1NQZsWK_i5Pt1kcjh9i2Thz2ngTBoEcVk9spqOywf4zVtcPtwNYDaGeO2dX50ZHszWx25oot4MSJQbdQ1n4R_leSRykhoPk9bMJcS0WR2YqBYxzqOIPe2KfBY6hsaaVnJ7kD65Zj7JAWNZ03c2vjBsVRMGr521SALDuKwuKnzJVplRwCcRrz4vEaxBe7izGCIx52qh4LBQyp5TYku5ZoDz_q-AG-pFrL9zGzoPODOmncag"
          />
        </div>
        <div className="max-w-5xl mx-auto z-10">
          <div className="relative inline-block mb-4">
            <span className="bg-brand-yellow px-4 py-1 border-2 border-brand-dark rounded-twelve font-bold text-xs uppercase -rotate-2 absolute -top-8 -right-12">
              Live Risk Intelligence
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-[140px] leading-[0.9] font-black tracking-tighter uppercase mb-8">
              SUPPLY
              <br />
              ON DEMAND
            </h1>
          </div>
          <p className="text-xl md:text-3xl font-medium max-w-2xl mx-auto mb-10 leading-snug">
            Design your network, model demand, and detect bottlenecks before disruption hits.
          </p>
          <Link className="inline-block bg-brand-coral border-4 border-brand-dark px-10 py-4 rounded-twelve text-xl font-black uppercase tracking-wider text-white hover:bg-white hover:text-brand-coral transition-all transform hover:scale-105 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" to="/app">
            Explore Scenarios
          </Link>
        </div>
      </section>

      <div className="bg-brand-coral py-4 border-y-4 border-brand-dark overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee gap-8 items-center text-sm font-black uppercase text-white">
          <span>Demand Forecasting</span> <span className="text-2xl">*</span>
          <span>Supplier Risk Scoring</span> <span className="text-2xl">*</span>
          <span>Real-time Alerts</span> <span className="text-2xl">*</span>
          <span>What-if Simulations</span> <span className="text-2xl">*</span>
          <span>Demand Forecasting</span> <span className="text-2xl">*</span>
          <span>Supplier Risk Scoring</span> <span className="text-2xl">*</span>
          <span>Real-time Alerts</span> <span className="text-2xl">*</span>
        </div>
      </div>

      <section id="solution" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-brand-yellow p-6 aspect-square border-4 border-brand-dark rounded-twelve flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute top-4 left-4 text-xs font-bold uppercase opacity-50">Use Case #1</div>
            <h3 className="text-2xl font-black leading-tight">Detect single-point warehouse failures across multi-tier flows</h3>
            <div className="mt-4 border-t-2 border-brand-dark pt-2 flex justify-between items-center">
              <span className="text-xs font-bold">Swipe to learn</span>
              <div className="w-8 h-8 rounded-full border-2 border-brand-dark flex items-center justify-center">-&gt;</div>
            </div>
          </div>

          <div className="bg-brand-purple p-6 aspect-square border-4 border-brand-dark rounded-twelve flex flex-col items-center justify-center text-center relative">
            <div className="bg-white border-2 border-brand-dark p-4 rotate-2 shadow-lg">
              <p className="font-bold mb-2">Demand plan vs capacity in one view</p>
              <div className="w-full h-32 border-2 border-brand-dark/20 border-dashed rounded flex flex-col gap-2 p-2">
                <div className="h-2 bg-brand-dark/10 w-3/4" />
                <div className="h-2 bg-brand-dark/10 w-full" />
                <div className="h-2 bg-brand-dark/10 w-2/3" />
              </div>
            </div>
          </div>

          <div className="bg-stone-100 p-6 aspect-square border-4 border-brand-dark rounded-twelve flex items-center justify-center">
            <div
              className="w-full h-full bg-cover bg-center border-2 border-brand-dark rounded relative"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBZuV1_55RMWRP2VMx5P6MO9yHVBm2ie8-UkyuURbe_APGXNzUfYGaN9fuTJXkdWhGj2laZCVK91mCNfhNsIugcbfKc-LdOQmfP2AmKdnw244WoezPQHGkX3BQZbuLW5c5Q5xsg_4W-EiFwPGIiahqFD7jnjMvgSWBrO7Tb69X9b1K4dto3LvPy3UIw8c2FQ7m7xYy-JlDVDoScHG5O5zW0S-5uo-0ZiNzrH4OEyHnqhlERcYTGJBH-45EBuB4EWWpHcnA4XzPWHg')",
              }}
            >
              <div className="absolute bottom-4 left-4 right-4 bg-white p-2 text-[10px] border-2 border-brand-dark">
                "Every node affects throughput. Know your weak links early."
              </div>
            </div>
          </div>

          <div className="bg-brand-green p-6 aspect-square border-4 border-brand-dark rounded-twelve flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-dark" />
              <span className="text-xs font-black">Network Snapshot</span>
            </div>
            <div className="flex-grow flex items-center justify-center italic font-medium">
              Which lane breaks first when demand spikes by 30%?
            </div>
            <div className="flex gap-4">
              <div className="w-4 h-4 rounded-full border-2 border-brand-dark" />
              <div className="w-4 h-4 rounded-full border-2 border-brand-dark" />
              <div className="w-4 h-4 rounded-full border-2 border-brand-dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-coral py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-8">
              5, 4, 3, 2, 1
              <br />
              That&apos;s how quickly you can stress-test your chain.
            </h2>
            <p className="text-white text-xl font-medium mb-10 max-w-lg">
              Move from reactive firefighting to proactive planning. Simulate disruption, compare alternatives, and choose resilient paths with confidence.
            </p>
            <a className="inline-block bg-brand-green border-4 border-brand-dark px-8 py-3 rounded-twelve font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" href="#pricing">
              Run a Simulation
            </a>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-white border-4 border-brand-dark p-8 rounded-twelve rotate-[-3deg] shadow-xl mb-12 relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-4 bg-brand-coral rounded-full" />
                <h3 className="font-black uppercase tracking-widest">Operations Leaders</h3>
              </div>
              <ul className="space-y-3 font-medium text-sm">
                <li className="flex gap-2"><span>-</span> Planning for a <strong>new product launch</strong></li>
                <li className="flex gap-2"><span>-</span> Preparing peak-season <strong>demand spikes</strong></li>
                <li className="flex gap-2"><span>-</span> Onboarding <strong>new suppliers</strong></li>
                <li className="flex gap-2"><span>-</span> Reducing <strong>single points of failure</strong></li>
                <li className="flex gap-2"><span>-</span> Aligning <strong>demand and supply</strong> weekly</li>
              </ul>
            </div>
            <div className="bg-brand-dark text-white border-4 border-white p-8 rounded-twelve rotate-[3deg] shadow-xl md:ml-20">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-4 bg-brand-green rounded-full" />
                <h3 className="font-black uppercase tracking-widest">Procurement and Planning Teams</h3>
              </div>
              <ul className="space-y-3 font-medium text-sm">
                <li className="flex gap-2"><span>-</span> Tracking supplier <strong>reliability drift</strong></li>
                <li className="flex gap-2"><span>-</span> Comparing alternate <strong>sourcing routes</strong></li>
                <li className="flex gap-2"><span>-</span> Building disruption <strong>contingency plans</strong></li>
                <li className="flex gap-2"><span>-</span> Improving service levels with <strong>faster decisions</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-brand-purple py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="w-full md:w-[500px] bg-white p-12 torn-paper border-x-2 border-brand-dark/10 shadow-2xl relative">
            <h3 className="text-2xl font-black uppercase mb-10 text-center tracking-tighter">YOU JUST MODELED A SUPPLY CHAIN!</h3>
            <div className="space-y-12">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center font-black flex-shrink-0">1</div>
                <div>
                  <h4 className="font-black text-lg">Build your network</h4>
                  <p className="text-sm opacity-70">Add suppliers, plants, warehouses, and channels with real dependencies.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center font-black flex-shrink-0">2</div>
                <div>
                  <h4 className="font-black text-lg">Run risk and demand analysis</h4>
                  <p className="text-sm opacity-70">Compute vulnerability, bottlenecks, concentration, and mismatch in real time.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center font-black flex-shrink-0">3</div>
                <div>
                  <h4 className="font-black text-lg">Act with confidence</h4>
                  <p className="text-sm opacity-70">Prioritize mitigation and re-route decisions before downtime impacts customers.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-8">I&apos;m intrigued. How does this work?</h2>
            <a className="inline-block bg-brand-coral border-4 border-brand-dark px-8 py-3 rounded-twelve font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all" href="#pricing">
              Start With a Plan
            </a>
          </div>
        </div>
      </section>

      <section className="bg-brand-green py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-16">Trusted by Teams Managing Complex Networks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-dark text-white p-10 rounded-twelve text-left border-b-8 border-brand-purple relative">
              <p className="italic text-lg mb-8">"We identified two hidden warehouse dependencies in week one and reduced potential downtime by 28%."</p>
              <div className="bg-brand-purple text-brand-dark text-[10px] font-black uppercase inline-block px-2 py-1">- HEAD OF OPERATIONS</div>
            </div>
            <div className="bg-brand-dark text-white p-10 rounded-twelve text-left border-b-8 border-brand-yellow relative scale-105">
              <p className="italic text-lg mb-8">"The demand-supply mismatch dashboard finally gave procurement and planning a single source of truth."</p>
              <div className="bg-brand-yellow text-brand-dark text-[10px] font-black uppercase inline-block px-2 py-1">- SUPPLY PLANNING LEAD</div>
            </div>
            <div className="bg-brand-dark text-white p-10 rounded-twelve text-left border-b-8 border-brand-coral relative">
              <p className="italic text-lg mb-8">"Scenario modeling helped us choose alternate suppliers before a regional disruption escalated."</p>
              <div className="bg-brand-coral text-white text-[10px] font-black uppercase inline-block px-2 py-1">- PROCUREMENT MANAGER</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-brand-coral py-32 px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase">Get Started! Choose your</h2>
          <div className="text-5xl md:text-7xl font-black text-white uppercase mb-16">Planning Plan</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto relative">
            <div className="bg-white border-4 border-brand-dark p-12 rounded-twelve relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand-coral border-4 border-brand-dark rounded-full flex items-center justify-center font-black text-white text-3xl rotate-12">S</div>
              <h3 className="text-3xl font-black mb-2 mt-4">Starter Network</h3>
              <p className="text-xs font-bold uppercase mb-8 opacity-60">For early teams that need visibility across <strong>1 workspace and core analytics.</strong></p>
              <div className="text-5xl font-black mb-10">120 USD</div>
              <ul className="text-left space-y-4 mb-12 font-bold text-sm">
                <li className="flex items-center gap-3"><span className="text-brand-coral">*</span> Topology-aware SPOF detection</li>
                <li className="flex items-center gap-3"><span className="text-brand-coral">*</span> Demand-supply mismatch insights</li>
                <li className="flex items-center gap-3"><span className="text-brand-coral">*</span> Geographic concentration monitoring</li>
              </ul>
              <button className="w-full bg-brand-green border-4 border-brand-dark py-4 rounded-twelve font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">Choose Starter</button>
            </div>

            <div className="bg-white border-4 border-brand-dark p-12 rounded-twelve relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand-purple border-4 border-brand-dark rounded-full flex items-center justify-center font-black text-white text-3xl -rotate-12">L</div>
              <h3 className="text-3xl font-black mb-2 mt-4">Enterprise Control Tower</h3>
              <p className="text-xs font-bold uppercase mb-8 opacity-60">For scale operations managing <strong>multi-workspace resilience and simulations.</strong></p>
              <div className="text-5xl font-black mb-10">400 USD</div>
              <ul className="text-left space-y-4 mb-12 font-bold text-sm">
                <li className="flex items-center gap-3"><span className="text-brand-purple">*</span> Advanced scenario simulation</li>
                <li className="flex items-center gap-3"><span className="text-brand-purple">*</span> Cross-workspace benchmarking</li>
                <li className="flex items-center gap-3"><span className="text-brand-purple">*</span> Priority alerting and executive reporting</li>
              </ul>
              <button className="w-full bg-brand-green border-4 border-brand-dark py-4 rounded-twelve font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">Choose Enterprise</button>
            </div>
          </div>
          <p className="mt-16 text-white font-bold text-sm">*Need custom onboarding, integrations, or private deployment? Contact our team.</p>
        </div>
      </section>

      <section className="py-32 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black leading-none mb-12">
            Precision of analytics.
            <br />
            Flexibility of simulation.
            <br />
            Reliability of resilient networks.
          </h2>
          <p className="text-xl font-medium max-w-2xl mx-auto opacity-70">
            Your supply chain is your competitive edge. Model it, stress-test it, and improve it continuously with COD.
          </p>
        </div>
      </section>

      <section id="faqs" className="bg-brand-dark py-32 px-6 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-5xl md:text-7xl font-black leading-none mb-8">
              Have more questions? We&apos;ve got you! <span className="text-brand-purple">SC</span>
            </h2>
          </div>
          <div className="space-y-4">
            <details className="group border-b border-white/20 pb-4" open>
              <summary className="flex justify-between items-center cursor-pointer list-none py-4">
                <h3 className="text-lg font-bold uppercase tracking-wide">How does the platform detect single points of failure?</h3>
                <span className="group-open:rotate-180 transition-transform">v</span>
              </summary>
              <p className="text-white/60 font-medium pb-4">We evaluate graph topology and dependency links to identify nodes whose failure disconnects major network paths.</p>
            </details>
            <details className="group border-b border-white/20 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4">
                <h3 className="text-lg font-bold uppercase tracking-wide">Can I analyze each workspace separately?</h3>
                <span className="group-open:rotate-180 transition-transform">v</span>
              </summary>
              <p className="text-white/60 font-medium pb-4">Yes. Every workspace has its own graph, node relationships, and risk outputs so insights stay context-specific.</p>
            </details>
            <details className="group border-b border-white/20 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4">
                <h3 className="text-lg font-bold uppercase tracking-wide">Do supplier risk scores change by network?</h3>
                <span className="group-open:rotate-180 transition-transform">v</span>
              </summary>
              <p className="text-white/60 font-medium pb-4">Yes. Historical supplier risk is adjusted by live graph context like dependency concentration, bottlenecks, and alternate paths.</p>
            </details>
            <details className="group border-b border-white/20 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none py-4">
                <h3 className="text-lg font-bold uppercase tracking-wide">Can we run demand surge and disruption simulations?</h3>
                <span className="group-open:rotate-180 transition-transform">v</span>
              </summary>
              <p className="text-white/60 font-medium pb-4">Absolutely. Use the simulation module to test demand spikes, transit delays, or supplier outages before they happen.</p>
            </details>
          </div>
        </div>
      </section>

      <footer className="bg-brand-dark p-6 md:p-12" id="blog">
        <div className="bg-brand-purple rounded-[32px] p-10 md:p-20 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow/30 rounded-full blur-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div>
              <div className="flex gap-4 text-xs font-black uppercase mb-12">
                <a className="hover:underline" href="#solution">Our Solution</a>
                <a className="hover:underline" href="#how">How It Works</a>
                <a className="hover:underline" href="#pricing">Plans</a>
                <a className="hover:underline" href="#faqs">FAQs</a>
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] mb-12">
                Came for visibility, stayed for <span className="text-white">resilience.</span>
              </h2>
              <div className="flex items-center gap-6">
                <span className="font-black uppercase tracking-widest text-xs">Come, stalk us:</span>
                <div className="flex gap-4">
                  <a className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors" href="#">IG</a>
                  <a className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors" href="#">LN</a>
                </div>
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-[24px] border-2 border-white/60">
              <p className="font-black mb-6 uppercase tracking-widest text-sm">Join our newsletter - Supply Chain Brief</p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input className="w-full bg-white border-2 border-brand-dark/10 rounded-full px-6 py-3 focus:outline-none focus:border-brand-dark" placeholder="Full Name" type="text" />
                <input className="w-full bg-white border-2 border-brand-dark/10 rounded-full px-6 py-3 focus:outline-none focus:border-brand-dark" placeholder="Email Address" type="email" />
                <select className="w-full bg-white border-2 border-brand-dark/10 rounded-full px-6 py-3 focus:outline-none focus:border-brand-dark appearance-none" defaultValue="">
                  <option value="" disabled>I&apos;m a...</option>
                  <option>Operations Leader</option>
                  <option>Supply Planner</option>
                  <option>Procurement Manager</option>
                </select>
                <button className="w-full bg-brand-coral border-4 border-brand-dark py-4 rounded-full font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all" type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-brand-dark/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-60">
            <p>Copyright COD Supply Chain Intelligence. All rights reserved.</p>
            <div className="flex gap-8">
              <a className="hover:underline" href="#">Terms of Use</a>
              <a className="hover:underline" href="#">Privacy Policy</a>
              <a className="hover:underline" href="#">Return and Refund Policy</a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/app"
              className="inline-block bg-brand-dark text-white border-2 border-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-colors"
            >
              Open Supply Chain App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
