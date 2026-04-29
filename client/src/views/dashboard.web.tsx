import { useState, useEffect, useRef } from "react";
import { getDashboardDataApi, updateProfilePictureApi, updateProfileApi, updatePasswordApi, setActiveSession } from "../controllers/api.client";
import type { User } from "../controllers/api.client";
import "../styles/auth.css";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function DashboardPage({ user: initialUser, onLogout }: DashboardProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({ name: initialUser.name || '', phone: initialUser.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardDataApi();
        setDashboardData(data);
        setUser(data.user);
        setActiveSession(data.user, localStorage.getItem('auth_token') || undefined);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await updateProfilePictureApi(base64String);
          setUser(res.user);
          setActiveSession(res.user, localStorage.getItem('auth_token') || undefined);
        } catch (error) {
          console.error("Failed to update profile picture:", error);
          alert("Failed to update profile picture");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await updateProfileApi(profileForm);
      setUser(res.user);
      setActiveSession(res.user, localStorage.getItem('auth_token') || undefined);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      await updatePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  if (loading) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--text-sec)" }}>Loading dashboard...</p>
      </div>
    );
  }

  const { stats, currentProject, recentInvoices, allProjects, allInvoices, messages } = dashboardData || {};

  return (
    <div
      style={{ 
        width: "100%", 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        padding: "2rem" 
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "row",
          gap: "2rem",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            flex: "0 0 250px",
            height: "fit-content",
            background: "var(--surface)",
            padding: "2rem",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="form-logo" style={{ marginBottom: "2rem" }}>
            Freelance.dev
          </div>
          <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div 
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--bg-color)",
                marginBottom: "1rem",
                cursor: "pointer",
                overflow: "hidden",
                border: "2px solid var(--accent)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative"
              }}
              onClick={handleProfilePictureClick}
              title="Click to change profile picture"
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "var(--text-sec)", fontSize: "24px" }}>{user.name.charAt(0)}</span>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleFileChange}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--text-sec)",
              }}
            >
              Logged in as
            </p>
            <h3 style={{ margin: "0.25rem 0 0", color: "var(--text-pri)" }}>
              {user.name}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--text-sec)",
              }}
            >
              {user.email}
            </p>
          </div>

          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}
          >
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("dashboard"); }}
              style={{
                padding: "0.5rem",
                color: activeTab === "dashboard" ? "var(--accent)" : "var(--text-sec)",
                fontWeight: activeTab === "dashboard" ? "500" : "normal",
                textDecoration: "none",
              }}
            >
              Dashboard
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("projects"); }}
              style={{
                padding: "0.5rem",
                color: activeTab === "projects" ? "var(--accent)" : "var(--text-sec)",
                fontWeight: activeTab === "projects" ? "500" : "normal",
                textDecoration: "none",
              }}
            >
              Projects
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("invoices"); }}
              style={{
                padding: "0.5rem",
                color: activeTab === "invoices" ? "var(--accent)" : "var(--text-sec)",
                fontWeight: activeTab === "invoices" ? "500" : "normal",
                textDecoration: "none",
              }}
            >
              Invoices
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("messages"); }}
              style={{
                padding: "0.5rem",
                color: activeTab === "messages" ? "var(--accent)" : "var(--text-sec)",
                fontWeight: activeTab === "messages" ? "500" : "normal",
                textDecoration: "none",
              }}
            >
              Messages
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab("settings"); }}
              style={{
                padding: "0.5rem",
                color: activeTab === "settings" ? "var(--accent)" : "var(--text-sec)",
                fontWeight: activeTab === "settings" ? "500" : "normal",
                textDecoration: "none",
              }}
            >
              Settings
            </a>
          </nav>

          <button
            onClick={onLogout}
            style={{
              marginTop: "3rem",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--text-sec)",
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--error)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-sec)"}
          >
            Sign out
          </button>
        </aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <header>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                color: "var(--text-pri)",
              }}
            >
              Freelancer Dashboard
            </h1>
            <p style={{ margin: "0.5rem 0 0", color: "var(--text-sec)" }}>
              Here's what's happening with your projects.
            </p>
          </header>

          {/* Dynamic Content Based on Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "var(--surface)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-sec)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Active Projects
                  </p>
                  <h2 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{stats?.activeProjectsCount || 0}</h2>
                </div>
                <div
                  style={{
                    background: "var(--surface)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-sec)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Pending Invoices
                  </p>
                  <h2 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>
                    ₹{stats?.pendingInvoicesTotal?.toLocaleString('en-IN') || "0.00"}
                  </h2>
                </div>
                <div
                  style={{
                    background: "var(--surface)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-sec)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Unread Messages
                  </p>
                  <h2 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{stats?.unreadMessagesCount || 0}</h2>
                </div>
              </div>

              {/* Active Project Tracker */}
              <section
                style={{
                  background: "var(--surface)",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 style={{ margin: "0 0 1.5rem" }}>Current Project</h3>
                {currentProject ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
                          {currentProject.title}
                        </h4>
                        <p
                          style={{
                            margin: "0.25rem 0 0",
                            color: "var(--text-sec)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Due: {new Date(currentProject.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span
                        style={{
                          background: "var(--bg-color)",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "99px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {currentProject.progress}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "var(--bg-color)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${currentProject.progress}%`,
                          height: "100%",
                          background: "var(--accent)",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      {currentProject.tasks?.map((task: any, index: number) => (
                        <div
                          key={index}
                          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: task.completed ? "var(--success-color, #10b981)" : "var(--accent)",
                            }}
                          ></div>
                          <p style={{ margin: 0, fontSize: "0.9rem", color: task.completed ? "var(--text-sec)" : "var(--text-pri)" }}>
                            {task.title}{" "}
                            {!task.completed && (
                              <span style={{ color: "var(--text-sec)" }}>
                                (In Progress)
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ color: "var(--text-sec)" }}>No active project currently.</p>
                )}
              </section>

              {/* Recent Invoices */}
              <section
                style={{
                  background: "var(--surface)",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 style={{ margin: "0 0 1.5rem" }}>Recent Invoices</h3>
                {recentInvoices && recentInvoices.length > 0 ? (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border)",
                          color: "var(--text-sec)",
                        }}
                      >
                        <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>
                          Invoice Number
                        </th>
                        <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>
                          Date
                        </th>
                        <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>
                          Amount
                        </th>
                        <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((invoice: any, index: number) => (
                        <tr key={index} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "1rem 0" }}>{invoice.invoiceNumber}</td>
                          <td
                            style={{
                              padding: "1rem 0",
                              color: "var(--text-sec)",
                            }}
                          >
                            {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </td>
                          <td style={{ padding: "1rem 0", fontWeight: "500" }}>
                            ₹{invoice.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: "1rem 0" }}>
                            <span
                              style={{
                                background: invoice.status === 'PAID' ? "#d1fae5" : "#fef3c7",
                                color: invoice.status === 'PAID' ? "#065f46" : "#92400e",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                              }}
                            >
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: "var(--text-sec)" }}>No recent invoices.</p>
                )}
              </section>
            </>
          )}

          {activeTab === "projects" && (
            <section style={{ background: "var(--surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>All Projects</h3>
              {allProjects && allProjects.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {allProjects.map((project: any, idx: number) => (
                    <div key={idx} style={{ padding: "1.5rem", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{project.title}</h4>
                        <span style={{ 
                          padding: "0.25rem 0.75rem", 
                          borderRadius: "99px", 
                          fontSize: "0.75rem", 
                          fontWeight: "bold",
                          background: project.status === 'Completed' ? "rgba(16, 185, 129, 0.15)" : "rgba(212, 169, 106, 0.15)",
                          color: project.status === 'Completed' ? "#10b981" : "#d4a96a"
                        }}>
                          {project.status}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 1rem", color: "var(--text-sec)", fontSize: "0.875rem" }}>
                        Due: {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | Progress: {project.progress}%
                      </p>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${project.progress}%`, height: "100%", background: project.status === 'Completed' ? "#10b981" : "#d4a96a", borderRadius: "3px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-sec)" }}>No projects found.</p>
              )}
            </section>
          )}

          {activeTab === "invoices" && (
            <section style={{ background: "var(--surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>All Invoices</h3>
              {allInvoices && allInvoices.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-sec)" }}>
                      <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>Invoice Number</th>
                      <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>Date</th>
                      <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>Amount</th>
                      <th style={{ paddingBottom: "0.75rem", fontWeight: "500" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInvoices.map((invoice: any, index: number) => (
                      <tr key={index} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "1rem 0" }}>{invoice.invoiceNumber}</td>
                        <td style={{ padding: "1rem 0", color: "var(--text-sec)" }}>
                          {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td style={{ padding: "1rem 0", fontWeight: "500" }}>₹{invoice.amount.toLocaleString('en-IN')}</td>
                        <td style={{ padding: "1rem 0" }}>
                          <span style={{
                            background: invoice.status === 'PAID' ? "#d1fae5" : "#fef3c7",
                            color: invoice.status === 'PAID' ? "#065f46" : "#92400e",
                            padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold"
                          }}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "var(--text-sec)" }}>No invoices found.</p>
              )}
            </section>
          )}

          {activeTab === "messages" && (
            <section style={{ background: "var(--surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <h3 style={{ margin: "0 0 1.5rem" }}>Messages</h3>
              {messages && messages.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {messages.map((msg: any, idx: number) => (
                    <div key={idx} style={{ 
                      padding: "1.5rem", 
                      background: msg.read ? "var(--bg-color)" : "var(--surface)", 
                      borderRadius: "8px", 
                      border: msg.read ? "1px solid var(--border)" : "1px solid var(--accent)",
                      borderLeft: msg.read ? undefined : "4px solid var(--accent)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: msg.read ? "var(--text-sec)" : "var(--text-pri)" }}>{msg.senderName}</h4>
                        {!msg.read && <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: "bold" }}>New</span>}
                      </div>
                      <p style={{ margin: 0, color: "var(--text-pri)", fontSize: "0.95rem" }}>{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-sec)" }}>No messages found.</p>
              )}
            </section>
          )}

          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <section style={{ background: "var(--surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ margin: "0 0 1.5rem" }}>Update Profile</h3>
                {profileMessage.text && (
                  <div style={{ 
                    padding: "1rem", 
                    marginBottom: "1.5rem", 
                    borderRadius: "8px", 
                    background: profileMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: profileMessage.type === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${profileMessage.type === 'success' ? '#10b981' : '#ef4444'}`
                  }}>
                    {profileMessage.text}
                  </div>
                )}
                <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      required 
                    />
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: "1rem" }}>Save Profile</button>
                </form>
              </section>

              <section style={{ background: "var(--surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <h3 style={{ margin: "0 0 1.5rem" }}>Change Password</h3>
                {passwordMessage.text && (
                  <div style={{ 
                    padding: "1rem", 
                    marginBottom: "1.5rem", 
                    borderRadius: "8px", 
                    background: passwordMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: passwordMessage.type === 'success' ? '#10b981' : '#ef4444',
                    border: `1px solid ${passwordMessage.type === 'success' ? '#10b981' : '#ef4444'}`
                  }}>
                    {passwordMessage.text}
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.currentPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required 
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirmPassword} 
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required 
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: "1rem" }}>Update Password</button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
