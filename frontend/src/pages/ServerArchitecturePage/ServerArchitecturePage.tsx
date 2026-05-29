import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Database,
  Globe,
  Terminal,
  FolderOpen,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Code,
  Layout,
  RefreshCw,
  Copy,
  CheckCircle2,
  HardDrive,
  Activity,
  Shield,
  MonitorPlay,
  Mail
} from "lucide-react";

interface NodeData {
  id: string;
  type: string;
  label: string;
  icon: any;
  port: string;
  path: string;
  description: string;
  details: string[];
  commands: { label: string; cmd: string }[];
  color: string;
  layer: "Infrastructure" | "Security" | "Web" | "Application" | "Data";
}

const SERVER_NODES: NodeData[] = [
  {
    id: "os",
    type: "Operating System",
    label: "Ubuntu 22.04 / 24.04 LTS",
    icon: MonitorPlay,
    port: "N/A",
    path: "/etc/os-release",
    description: "The foundational Linux host server continuously powering all OptiConnect infrastructure and network orchestration.",
    layer: "Infrastructure",
    details: [
      "Hardware: Virtual Machine / Bare Metal Host",
      "Public IP: 103.120.190.2 (External Mapping)",
      "Network IP: 172.16.20.11 (Internal Cluster)",
      "Domain: gis.optimaltele.net (GoDaddy DNS A-Record → 103.120.190.2)",
      "Key Users: root, opticonnect",
      "All service ports use TCP protocol exclusively — no UDP in this architecture."
    ],
    commands: [
      { label: "Check Resource Usage", cmd: "top" },
      { label: "Check Disk Space", cmd: "df -h" },
      { label: "Check Memory", cmd: "free -m" },
      { label: "List All Listening Ports", cmd: "sudo netstat -tlnp" }
    ],
    color: "orange"
  },
  {
    id: "firewall",
    type: "Security Perimeter",
    label: "UFW Firewall",
    icon: Shield,
    port: "N/A",
    path: "/etc/default/ufw",
    description: "Uncomplicated Firewall managing the IP tables to strictly gate incoming and outgoing cluster traffic. All rules target TCP only.",
    layer: "Security",
    details: [
      "ALLOW TCP/22 — SSH administrator tunneling.",
      "ALLOW TCP/80 — HTTP traffic (Nginx). Auto-redirects to HTTPS.",
      "ALLOW TCP/443 — HTTPS traffic (Nginx + SSL/TLS via Let's Encrypt).",
      "DENY TCP/3000 — Node.js API blocked externally. Only localhost access via Nginx proxy.",
      "DENY TCP/5432 — PostgreSQL blocked externally. Only localhost access from PM2 backend.",
      "DENY TCP/587 — SMTP outbound only. No inbound mail server exposure."
    ],
    commands: [
      { label: "Check Firewall Status", cmd: "sudo ufw status verbose" },
      { label: "Check All Allowed Ports", cmd: "sudo ufw status numbered" },
      { label: "Verify No UDP Rules", cmd: "sudo ufw status | grep -i udp" }
    ],
    color: "rose"
  },
  {
    id: "nginx",
    type: "Reverse Proxy + SSL",
    label: "Nginx Server",
    icon: Globe,
    port: "TCP/80, TCP/443",
    path: "/etc/nginx/sites-available/default",
    description: "High-performance edge proxy intercepting all public HTTP/HTTPS requests and routing them transparently to internal services. Secured with a free Let's Encrypt SSL certificate.",
    layer: "Web",
    details: [
      "TCP/80 (HTTP): Catches unencrypted requests → auto-redirects to HTTPS (301).",
      "TCP/443 (HTTPS): Terminates SSL/TLS. Serves all production traffic securely.",
      "SSL Certificate: Let's Encrypt via Certbot. Auto-renews every 90 days.",
      "Domain: gis.optimaltele.net + catch-all (server_name _) for IP-based access.",
      "Proxy: /api/* → http://127.0.0.1:3000 (Node.js backend via TCP).",
      "Proxy: /ws → http://127.0.0.1:3000 (WebSocket upgrade via TCP).",
      "Static: / → /var/www/opticonnect/frontend (React SPA with try_files fallback).",
      "Upload Limit: client_max_body_size = 100M."
    ],
    commands: [
      { label: "Restart Nginx", cmd: "sudo systemctl restart nginx" },
      { label: "Check Status", cmd: "sudo systemctl status nginx" },
      { label: "Test Configuration Syntax", cmd: "sudo nginx -t" },
      { label: "Renew SSL Certificate", cmd: "sudo certbot renew --dry-run" },
      { label: "View SSL Expiry", cmd: "sudo certbot certificates" }
    ],
    color: "emerald"
  },
  {
    id: "frontend",
    type: "Client Build",
    label: "React Frontend",
    icon: Layout,
    port: "TCP/81 (Prod) · TCP/3005 (Dev)",
    path: "/var/www/opticonnect/frontend",
    description: "Compiled, minified, and optimized React 19 single-page application representing the actual OptiConnect UI.",
    layer: "Web",
    details: [
      "Production: Static files served natively by Nginx on TCP/80 & TCP/443.",
      "Production PORT env: TCP/81 (reserved for direct serve-static if needed).",
      "Local Development: Runs locally via react-scripts on TCP/3005.",
      "API Routing: Uses relative paths (/api) — environment agnostic.",
      "WebSocket Routing: Dynamically resolves ws:// or wss:// from browser host.",
      "Uploaded via SCP to ~/deploy_staging and injected by master executor."
    ],
    commands: [
      { label: "List Static Files", cmd: "ls -la /var/www/opticonnect/frontend" },
      { label: "Clear Cache Manually", cmd: "sudo rm -rf /var/www/opticonnect/frontend/*" }
    ],
    color: "blue"
  },
  {
    id: "pm2",
    type: "Process Daemon",
    label: "PM2 Manager",
    icon: Activity,
    port: "N/A",
    path: "~/.pm2",
    description: "Production process manager ensuring the critical Node.js Express API stays alive 24/7 on TCP/3000. Auto-restarts on crash.",
    layer: "Application",
    details: [
      "Monitors Memory and CPU footprints automatically.",
      "Auto-starts the backend on server boot (pm2 startup).",
      "Maintains automated log rotation to prevent infinite disk inflation.",
      "Binds backend to TCP/3000 in production (TCP/82 in development)."
    ],
    commands: [
      { label: "Monitor PM2 Dash", cmd: "pm2 monit" },
      { label: "Restart All Services", cmd: "pm2 restart all --update-env" },
      { label: "Flush Logs", cmd: "pm2 flush" }
    ],
    color: "purple"
  },
  {
    id: "backend",
    type: "REST API",
    label: "Node.js Environment",
    icon: Server,
    port: "TCP/3000 (Prod) · TCP/82 (Dev)",
    path: "/var/www/opticonnect/backend",
    description: "The core computational brain of OptiConnect. Executes permissions, spatial queries, and authentication natively.",
    layer: "Application",
    details: [
      "Production: Listens on TCP/3000 internally. Proxied by Nginx on TCP/443.",
      "Development: Listens on TCP/82 directly for local testing.",
      "Reads secure tokens from local .env.production.",
      "Acts as the sole authorized TCP gateway to the PostgreSQL database.",
      "Handles SMTP email dispatch to external providers on TCP/587."
    ],
    commands: [
      { label: "Restart Application", cmd: "pm2 restart opticonnect-backend" },
      { label: "Follow PM2 Logs Live", cmd: "pm2 logs opticonnect-backend" },
      { label: "Read Env Vars", cmd: "cat /var/www/opticonnect/backend/.env.production" }
    ],
    color: "indigo"
  },
  {
    id: "websocket",
    type: "Real-Time Engine",
    label: "Native HTML5 WebSockets",
    icon: RefreshCw,
    port: "TCP/3000 (shared)",
    path: "/var/www/opticonnect/backend/src/shared/services/websocket/WebSocketServer.js",
    description: "Native HTML5 WebSocket server using the ws library, tightly coupled to the HTTP server on TCP/3000 for real-time telemetry, interactive mappings, and session tracking.",
    layer: "Application",
    details: [
      "Protocol: Native WebSocket (ws:// / wss://) — NOT Socket.IO.",
      "Multiplexes on TCP/3000 (shared with Express API on same HTTP server).",
      "Mount Path: /ws (e.g., wss://gis.optimaltele.net/ws?token=...).",
      "Nginx proxies /ws with HTTP 1.1 Upgrade + Connection headers over TCP.",
      "Ensures zero-latency client state synchronization globally.",
      "Auto-reconnects with exponential backoff on connection failure."
    ],
    commands: [
      { label: "Test Socket Stream", cmd: "wscat -c ws://127.0.0.1:3000/ws" },
      { label: "Test via Domain", cmd: "wscat -c wss://gis.optimaltele.net/ws" }
    ],
    color: "teal"
  },
  {
    id: "database",
    type: "RDBMS + GIS",
    label: "PostgreSQL 16",
    icon: Database,
    port: "TCP/5432",
    path: "/var/lib/postgresql/16/main",
    description: "Robust industrial relational database tightly integrated with PostGIS for blazing-fast spatial topology processing. Strictly localhost TCP connections only.",
    layer: "Data",
    details: [
      "Listens on TCP/5432 exclusively on 127.0.0.1 (localhost only).",
      "External TCP connections to port 5432 are actively rejected by UFW.",
      "Only the PM2-managed Node.js backend can connect over TCP.",
      "Automated Migrations Tracker: _system_migrations table."
    ],
    commands: [
      { label: "Launch Interactive Shell", cmd: "sudo -u postgres psql -d opticonnect_gis_db" },
      { label: "Check Error Logs", cmd: "sudo tail -f /var/log/postgresql/postgresql-16-main.log" },
      { label: "Verify TCP Binding", cmd: "sudo netstat -tlnp | grep 5432" }
    ],
    color: "pink"
  },
  {
    id: "email",
    type: "SMTP Relay",
    label: "Email Service (Nodemailer)",
    icon: Mail,
    port: "TCP/587 (STARTTLS)",
    path: "/var/www/opticonnect/backend/.env.production",
    description: "Outbound SMTP relay used by the Node.js backend for transactional emails such as password resets, OTP codes, and system notifications.",
    layer: "Application",
    details: [
      "Protocol: SMTP with STARTTLS encryption over TCP/587.",
      "Direction: Outbound only — no inbound mail server.",
      "Triggered by: Password reset requests, MFA OTP delivery, admin notifications.",
      "Library: Nodemailer with secure transport configuration.",
      "Credentials stored securely in .env.production (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS)."
    ],
    commands: [
      { label: "Test SMTP Connectivity", cmd: "openssl s_client -starttls smtp -connect smtp.provider:587" },
      { label: "Check Email Config", cmd: "grep EMAIL /var/www/opticonnect/backend/.env.production" }
    ],
    color: "orange"
  }
];

export const ServerArchitecturePage: React.FC = () => {
  const [activeNode, setActiveNode] = useState<NodeData | null>(SERVER_NODES[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald": return "bg-emerald-500 text-emerald-100 ring-emerald-500/30";
      case "blue": return "bg-blue-500 text-blue-100 ring-blue-500/30";
      case "indigo": return "bg-indigo-500 text-indigo-100 ring-indigo-500/30";
      case "rose": return "bg-rose-500 text-rose-100 ring-rose-500/30";
      case "orange": return "bg-orange-500 text-orange-100 ring-orange-500/30";
      case "purple": return "bg-purple-500 text-purple-100 ring-purple-500/30";
      case "pink": return "bg-pink-500 text-pink-100 ring-pink-500/30";
      case "teal": return "bg-teal-500 text-teal-100 ring-teal-500/30";
      default: return "bg-gray-500 text-gray-100 ring-gray-500/30";
    }
  };

  const getBorderClasses = (color: string) => {
    switch (color) {
      case "emerald": return "border-emerald-500";
      case "blue": return "border-blue-500";
      case "indigo": return "border-indigo-500";
      case "rose": return "border-rose-500";
      case "orange": return "border-orange-500";
      case "purple": return "border-purple-500";
      case "pink": return "border-pink-500";
      case "teal": return "border-teal-500";
      default: return "border-gray-500";
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 w-full bg-slate-50 dark:bg-[#0f172a] border-t border-gray-200 dark:border-gray-800 overflow-hidden">
      
      {/* Visual Diagram Left Panel */}
      <div className="w-full md:w-[50%] min-h-0 p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col items-center relative" style={{ overscrollBehavior: 'contain' }}>
        <div className="w-full max-w-lg space-y-6 relative">
          
          {/* Main Connecting SVG Line */}
          <div className="absolute left-12 top-10 bottom-10 w-1 bg-gradient-to-b from-orange-400 via-indigo-400 to-pink-500 dark:from-orange-600 dark:via-indigo-600 dark:to-pink-700 rounded-full -z-10 shadow-[0_0_15px_rgba(99,102,241,0.4)] md:left-14"></div>

          {SERVER_NODES.map((node, index) => {
            const Icon = node.icon;
            const isActive = activeNode?.id === node.id;
            
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                onClick={() => setActiveNode(node)}
                className={`w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-5 cursor-pointer border-2 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-5 relative z-10 group ${
                  isActive 
                    ? `border-${node.color}-500 shadow-${node.color}-500/20 scale-[1.03] z-20` 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                {/* Horizontal Connector Branch */}
                <div className={`absolute -left-5 md:-left-6 top-1/2 -translate-y-1/2 w-5 md:w-6 h-1 rounded-l-full ${isActive ? `bg-${node.color}-500 shadow-[0_0_8px_${node.color}]` : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'} transition-colors duration-300`} />

                <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ring-4 transition-all duration-300 ${getColorClasses(node.color)} ${isActive ? 'ring-offset-2 dark:ring-offset-slate-800' : 'ring-transparent'}`}>
                  <Icon className="w-7 h-7 flex-shrink-0" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? `text-${node.color}-600 dark:text-${node.color}-400` : 'text-slate-500 dark:text-slate-400'}`}>
                        {node.layer} LAYER
                      </p>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-tight flex items-center gap-2">
                        {node.label}
                      </h3>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-2 h-2 rounded-full bg-${node.color}-500 shadow-[0_0_8px_rgba(var(--${node.color}-500),0.8)] mt-2`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                      <Cpu className="w-3 h-3" />
                      {node.type}
                    </span>
                    {node.port !== "N/A" && (
                       <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                         <HardDrive className="w-3 h-3" />
                         Port: {node.port}
                       </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Details Right Panel */}
      <div className="w-full md:w-[50%] min-h-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] z-30 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8 md:p-12 flex-1 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                <div className={`p-4 rounded-xl ${getColorClasses(activeNode.color)} shadow-lg shadow-${activeNode.color}-500/20`}>
                  <activeNode.icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`w-4 h-4 text-${activeNode.color}-500`} />
                    <span className={`text-xs font-bold uppercase tracking-widest text-${activeNode.color}-500 dark:text-${activeNode.color}-400`}>
                      {activeNode.layer} Node
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {activeNode.label}
                  </h2>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-slate-700 dark:text-slate-300 m-0">{activeNode.description}</p>
              </div>

              <div className="space-y-8">
                {/* Configuration Block */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-slate-400" /> Physical System Path
                  </h4>
                  <div className="bg-slate-50 dark:bg-[#0f172a] rounded-xl p-4 font-mono text-[13px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-inner flex justify-between items-center group cursor-pointer" onClick={() => handleCopy(activeNode.path)}>
                    <span className="truncate mr-4 flex items-center gap-2">
                      <span className="text-slate-400 select-none">root@opticonnect:~#</span>
                      <span className="text-indigo-600 dark:text-indigo-400 pr-2">{activeNode.path}</span>
                    </span>
                    <button 
                      className={`transition-all duration-200 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${copiedCmd === activeNode.path ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 border text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100'}`}
                    >
                      {copiedCmd === activeNode.path ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Config Path</>}
                    </button>
                  </div>
                </div>

                {/* Characteristics */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-400" /> Core Responsibilities
                  </h4>
                  <ul className="space-y-3">
                    {activeNode.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-4 text-[14px] text-slate-700 dark:text-slate-300">
                        <div className={`mt-1 p-1 rounded-md bg-${activeNode.color}-500/10 shrink-0`}>
                           <ArrowRight className={`w-3.5 h-3.5 text-${activeNode.color}-500 dark:text-${activeNode.color}-400`} />
                        </div>
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Operations */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" /> Administrator Operations
                  </h4>
                  <div className="space-y-3">
                    {activeNode.commands.map((cmd, i) => (
                      <div key={i} className={`bg-slate-50 dark:bg-[#0f172a] rounded-xl p-4 border-l-[6px] ${getBorderClasses(activeNode.color)} flex flex-col gap-2 border-[1px] border-y-slate-200 border-r-slate-200 dark:border-y-slate-700 dark:border-r-slate-700 shadow-sm group hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer`} onClick={() => handleCopy(cmd.cmd)}>
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cmd.label}</span>
                        <div className="flex justify-between items-center">
                           <span className="text-[13px] font-mono font-medium text-slate-800 dark:text-slate-200 truncate pr-4">
                             <span className="text-slate-400 mr-2 select-none">$</span>
                             {cmd.cmd}
                           </span>
                           <button 
                             className={`shrink-0 transition-all duration-200 ${copiedCmd === cmd.cmd ? 'text-green-500' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-500 dark:hover:text-indigo-400'}`}
                             title="Copy to clipboard"
                           >
                             {copiedCmd === cmd.cmd ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[30px] opacity-20 rounded-full animate-pulse"></div>
                <RefreshCw className="w-12 h-12 animate-spin-slow relative" />
              </div>
              <p className="text-lg font-medium">Select a system node to inspect configuration.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServerArchitecturePage;
