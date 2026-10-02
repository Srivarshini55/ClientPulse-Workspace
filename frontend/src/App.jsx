import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://clientpulse-backend-qgwx.onrender.com";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

const SOURCE_OPTIONS = [
  "Website",
  "Referral",
  "Social Media",
  "Email",
  "Phone",
  "Other",
];

const EMPTY_FORM = {
  clientCompanyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  enquirySource: "Website",
  serviceRequirement: "",
  requirementDescription: "",
  estimatedBudget: "",
  status: "New",
  assignedPerson: "",
  nextFollowUpDate: "",
  additionalNotes: "",
};

function App() {
  const [enquiries, setEnquiries] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [assignedFilter, setAssignedFilter] = useState("All Assigned");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState("All Follow-ups");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  // -----------------------------
  // FETCH ENQUIRIES
  // -----------------------------
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);
      setEnquiries(response.data || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load enquiries. Please make sure the Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // -----------------------------
  // TOAST
  // -----------------------------
  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // -----------------------------
  // FORM HANDLING
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (enquiry) => {
    setEditingId(enquiry.id);

    setForm({
      clientCompanyName: enquiry.clientCompanyName || "",
      contactPerson: enquiry.contactPerson || "",
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      enquirySource: enquiry.enquirySource || "Website",
      serviceRequirement: enquiry.serviceRequirement || "",
      requirementDescription: enquiry.requirementDescription || "",
      estimatedBudget: enquiry.estimatedBudget ?? "",
      status: enquiry.status || "New",
      assignedPerson: enquiry.assignedPerson || "",
      nextFollowUpDate: enquiry.nextFollowUpDate || "",
      additionalNotes: enquiry.additionalNotes || "",
    });

    setShowForm(true);
  };

  // -----------------------------
  // CREATE / UPDATE
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        estimatedBudget:
          form.estimatedBudget === ""
            ? 0
            : Number(form.estimatedBudget),
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        showToast("Enquiry updated successfully");
      } else {
        await axios.post(API_URL, payload);
        showToast("Enquiry created successfully");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await fetchEnquiries();
    } catch (err) {
      console.error(err);

      const backendMessage =
        err?.response?.data?.message ||
        "Something went wrong while saving the enquiry.";

      showToast(backendMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      showToast("Enquiry deleted successfully");

      await fetchEnquiries();
    } catch (err) {
      console.error(err);
      showToast("Unable to delete enquiry", "error");
    }
  };

  // -----------------------------
  // VIEW
  // -----------------------------
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);

      setSelectedEnquiry(response.data);
      setShowView(true);
    } catch (err) {
      console.error(err);
      showToast("Unable to load enquiry details", "error");
    }
  };

  // -----------------------------
  // FILTER DATA
  // -----------------------------
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        item.clientCompanyName?.toLowerCase().includes(searchText) ||
        item.contactPerson?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.serviceRequirement?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All Status" ||
        item.status === statusFilter;

      const matchesSource =
        sourceFilter === "All Sources" ||
        item.enquirySource === sourceFilter;

      const matchesAssigned =
        assignedFilter === "All Assigned" ||
        item.assignedPerson === assignedFilter;

      const budget = Number(item.estimatedBudget || 0);
      const matchesMinBudget =
        minBudget === "" || budget >= Number(minBudget);
      const matchesMaxBudget =
        maxBudget === "" || budget <= Number(maxBudget);

      const followUpDate = item.nextFollowUpDate
        ? new Date(item.nextFollowUpDate)
        : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (followUpDate) followUpDate.setHours(0, 0, 0, 0);

      const isOverdue =
        !!followUpDate &&
        followUpDate < today &&
        item.status !== "Won" &&
        item.status !== "Lost";
      const isDueToday =
        !!followUpDate &&
        followUpDate.getTime() === today.getTime() &&
        item.status !== "Won" &&
        item.status !== "Lost";
      const isUpcoming =
        !!followUpDate &&
        followUpDate > today &&
        item.status !== "Won" &&
        item.status !== "Lost";

      const matchesFollowUp =
        followUpFilter === "All Follow-ups" ||
        (followUpFilter === "Overdue" && isOverdue) ||
        (followUpFilter === "Due Today" && isDueToday) ||
        (followUpFilter === "Upcoming" && isUpcoming) ||
        (followUpFilter === "No Date" && !followUpDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesAssigned &&
        matchesMinBudget &&
        matchesMaxBudget &&
        matchesFollowUp
      );
    });
  }, [
    enquiries,
    search,
    statusFilter,
    sourceFilter,
    assignedFilter,
    minBudget,
    maxBudget,
    followUpFilter,
  ]);

  // -----------------------------
  // DASHBOARD METRICS
  // -----------------------------
  const total = enquiries.length;

  const countByStatus = (status) =>
    enquiries.filter((item) => item.status === status).length;

  const pipelineValue = enquiries
    .filter((item) => item.status !== "Lost")
    .reduce(
      (sum, item) => sum + Number(item.estimatedBudget || 0),
      0
    );

  const wonValue = enquiries
    .filter((item) => item.status === "Won")
    .reduce(
      (sum, item) => sum + Number(item.estimatedBudget || 0),
      0
    );

  const getFollowUpType = (item) => {
    if (!item.nextFollowUpDate || item.status === "Won" || item.status === "Lost") {
      return "none";
    }

    const today = new Date();
    const followUp = new Date(item.nextFollowUpDate);
    today.setHours(0, 0, 0, 0);
    followUp.setHours(0, 0, 0, 0);

    if (followUp < today) return "overdue";
    if (followUp.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  const followUps = enquiries.filter((item) => {
    const type = getFollowUpType(item);
    return type === "overdue" || type === "today";
  }).length;

  const overdueFollowUps = enquiries.filter(
    (item) => getFollowUpType(item) === "overdue"
  ).length;

  const upcomingFollowUps = enquiries.filter(
    (item) => getFollowUpType(item) === "upcoming"
  ).length;

  const conversionRate =
    total > 0 ? Math.round((countByStatus("Won") / total) * 100) : 0;

  const assignedPeople = [
    ...new Set(
      enquiries
        .map((item) => item.assignedPerson)
        .filter(Boolean)
    ),
  ];

  const recentEnquiries = [...enquiries]
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    .slice(0, 5);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setSourceFilter("All Sources");
    setAssignedFilter("All Assigned");
    setMinBudget("");
    setMaxBudget("");
    setFollowUpFilter("All Follow-ups");
  };

  const exportCSV = () => {
    if (!filteredEnquiries.length) {
      showToast("No enquiries to export", "error");
      return;
    }

    const headers = [
      "Company", "Contact Person", "Email", "Phone", "Source",
      "Service Requirement", "Estimated Budget", "Status",
      "Assigned Person", "Next Follow-up", "Additional Notes"
    ];

    const rows = filteredEnquiries.map((item) => [
      item.clientCompanyName, item.contactPerson, item.email, item.phone,
      item.enquirySource, item.serviceRequirement, item.estimatedBudget,
      item.status, item.assignedPerson, item.nextFollowUpDate, item.additionalNotes
    ]);

    const escapeCSV = (value) => {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientpulse-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${filteredEnquiries.length} enquiries exported successfully`);
  };

  // -----------------------------
  // HELPERS
  // -----------------------------
  const initials = (name = "") => {
    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]?.slice(0, 2).toUpperCase() || "CP";
    }

    return (
      parts[0]?.[0] +
      parts[parts.length - 1]?.[0]
    ).toUpperCase();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const statusClass = (status) => {
    return status
      ?.toLowerCase()
      .replace(/\s+/g, "-");
  };

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  const navigate = (page) => {
    setActivePage(page);
  };

  return (
    <>
      <div className="app-shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-logo">CP</div>

            <div>
              <h2>ClientPulse</h2>
              <span>CRM Workspace</span>
            </div>
          </div>

          <div className="sidebar-section-title">
            WORKSPACE
          </div>

          <nav className="sidebar-nav">
            <button
              className={
                activePage === "dashboard"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate("dashboard")}
            >
              <span className="nav-icon">⌂</span>
              Dashboard
            </button>

            <button
              className={
                activePage === "enquiries"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate("enquiries")}
            >
              <span className="nav-icon">▣</span>
              Enquiries
              <span className="nav-count">{total}</span>
            </button>

            <button
              className={
                activePage === "pipeline"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate("pipeline")}
            >
              <span className="nav-icon">◈</span>
              Pipeline
            </button>
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-mini-card">
              <div className="mini-dot"></div>

              <div>
                <strong>System Online</strong>
                <span>API connected</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          {/* TOP BAR */}
          <header className="topbar">
            <div>
              <span className="breadcrumb">ClientPulse</span>
              <span className="breadcrumb-divider">/</span>
              <span className="breadcrumb-current">
                {activePage === "dashboard"
                  ? "Dashboard"
                  : activePage === "enquiries"
                  ? "Enquiries"
                  : "Pipeline"}
              </span>
            </div>

            <div className="topbar-actions">
              <button className="icon-button">
                🔔
              </button>

              <div className="profile">
                <div className="profile-avatar">
                  A
                </div>

                <div>
                  <strong>Admin</strong>
                  <span>Administrator</span>
                </div>
              </div>
            </div>
          </header>

          {/* PAGE */}
          <div className="page-content">
            {activePage === "dashboard" && (
              <Dashboard
                total={total}
                newCount={countByStatus("New")}
                contacted={countByStatus("Contacted")}
                qualified={countByStatus("Qualified")}
                proposal={countByStatus("Proposal Sent")}
                negotiation={countByStatus("Negotiation")}
                won={countByStatus("Won")}
                lost={countByStatus("Lost")}
                pipelineValue={pipelineValue}
                wonValue={wonValue}
                followUps={followUps}
                overdueFollowUps={overdueFollowUps}
                upcomingFollowUps={upcomingFollowUps}
                conversionRate={conversionRate}
                assignedPeople={assignedPeople.length}
                recentEnquiries={recentEnquiries}
                formatCurrency={formatCurrency}
                initials={initials}
                statusClass={statusClass}
                navigate={navigate}
                openCreateForm={openCreateForm}
                handleView={handleView}
              />
            )}

            {activePage === "enquiries" && (
              <EnquiriesPage
                enquiries={enquiries}
                filteredEnquiries={filteredEnquiries}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sourceFilter={sourceFilter}
                setSourceFilter={setSourceFilter}
                assignedFilter={assignedFilter}
                setAssignedFilter={setAssignedFilter}
                minBudget={minBudget}
                setMinBudget={setMinBudget}
                maxBudget={maxBudget}
                setMaxBudget={setMaxBudget}
                followUpFilter={followUpFilter}
                setFollowUpFilter={setFollowUpFilter}
                clearFilters={clearFilters}
                exportCSV={exportCSV}
                loading={loading}
                error={error}
                openCreateForm={openCreateForm}
                openEditForm={openEditForm}
                handleView={handleView}
                handleDelete={handleDelete}
                formatCurrency={formatCurrency}
                initials={initials}
                statusClass={statusClass}
              />
            )}

            {activePage === "pipeline" && (
              <PipelinePage
                enquiries={enquiries}
                formatCurrency={formatCurrency}
                initials={initials}
                statusClass={statusClass}
                handleView={handleView}
              />
            )}
          </div>
        </main>

        {/* CREATE / EDIT MODAL */}
        {showForm && (
          <EnquiryModal
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            setShowForm={setShowForm}
            editingId={editingId}
            saving={saving}
          />
        )}

        {/* VIEW MODAL */}
        {showView && selectedEnquiry && (
          <ViewModal
            enquiry={selectedEnquiry}
            setShowView={setShowView}
            openEditForm={() => {
              setShowView(false);
              openEditForm(selectedEnquiry);
            }}
            formatCurrency={formatCurrency}
            statusClass={statusClass}
            initials={initials}
          />
        )}

        {/* TOAST */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <span>
              {toast.type === "success" ? "✓" : "!"}
            </span>

            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  total,
  newCount,
  contacted,
  qualified,
  proposal,
  negotiation,
  won,
  lost,
  pipelineValue,
  wonValue,
  followUps,
  overdueFollowUps,
  upcomingFollowUps,
  conversionRate,
  assignedPeople,
  recentEnquiries,
  formatCurrency,
  initials,
  statusClass,
  navigate,
  openCreateForm,
  handleView,
}) {
  const [graphAnimated, setGraphAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGraphAnimated(true), 180);
    return () => clearTimeout(timer);
  }, [total, newCount, contacted, qualified, proposal, negotiation, won, lost]);

  const stages = [
    ["New", newCount],
    ["Contacted", contacted],
    ["Qualified", qualified],
    ["Proposal Sent", proposal],
    ["Negotiation", negotiation],
    ["Won", won],
  ];

  return (
    <div className="page-enter">
      <section className="hero">
        <div>
          <span className="eyebrow">
            BUSINESS ENQUIRY MANAGEMENT
          </span>

          <h1>Good evening, Admin 👋</h1>

          <p>
            Track enquiries, manage your pipeline and stay on top
            of follow-ups.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          <span>＋</span>
          New Enquiry
        </button>
      </section>

      {/* KPI */}
      <section className="metrics-grid">
        <MetricCard
          title="Total Enquiries"
          value={total}
          subtitle="All enquiries"
          icon="▣"
          className="blue"
        />

        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          subtitle="Active opportunity value"
          icon="◈"
          className="purple"
          currency
        />

        <MetricCard
          title="Follow-ups Due"
          value={followUps}
          subtitle="Need attention"
          icon="◷"
          className="orange"
        />

        <MetricCard
          title="Won Deals"
          value={won}
          subtitle={formatCurrency(wonValue)}
          icon="✓"
          className="green"
        />

        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Enquiries converted to Won"
          icon="↗"
          className="indigo"
        />
      </section>

      <div className="dashboard-grid">
        {/* PIPELINE */}
        <section className="card pipeline-card">
          <div className="card-header">
            <div>
              <span className="section-kicker">
                SALES FLOW
              </span>
              <h2>Enquiry Pipeline</h2>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("pipeline")}
            >
              View pipeline →
            </button>
          </div>

          <div className="pipeline-flow">
            {stages.map(([name, count], index) => (
              <div
                className="pipeline-stage"
                key={name}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div className="stage-top">
                  <span className="stage-dot"></span>
                  <span>{name}</span>
                  <strong>{count}</strong>
                </div>

                <div className="stage-track">
                  <div
                    className="stage-progress"
                    style={{
                      width:
                        total > 0
                          ? `${Math.max(
                              (count / total) * 100,
                              count > 0 ? 8 : 0
                            )}%`
                          : "0%",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INSIGHTS */}
        <section className="card insights-card">
          <div className="card-header">
            <div>
              <span className="section-kicker">
                SNAPSHOT
              </span>
              <h2>Quick Insights</h2>
            </div>
          </div>

          <div className="insight-list">
            <Insight
              icon="●"
              title="Active Enquiries"
              value={`${total - won - lost} active records`}
            />

            <Insight
              icon="◷"
              title="Follow-ups"
              value={`${followUps} due · ${overdueFollowUps} overdue`}
            />

            <Insight
              icon="↗"
              title="Conversion"
              value={`${conversionRate}% won conversion rate`}
            />

            <Insight
              icon="♙"
              title="Assigned People"
              value={`${assignedPeople.length} people handling enquiries`}
            />

            <Insight
              icon="₹"
              title="Estimated Pipeline"
              value={formatCurrency(pipelineValue)}
            />
          </div>
        </section>
      </div>

      {/* PERFORMANCE GRAPH */}
      <section className="card graph-card">
        <div className="card-header">
          <div>
            <span className="section-kicker">PIPELINE PERFORMANCE</span>
            <h2>Enquiry Flow Analytics</h2>
          </div>
          <div className="graph-legend">
            <span className="legend-dot"></span>
            <span>Enquiries by stage</span>
          </div>
        </div>

        <AnimatedPipelineGraph
          key={`${newCount}-${contacted}-${qualified}-${proposal}-${negotiation}-${won}-${lost}`}
          values={[
            newCount,
            contacted,
            qualified,
            proposal,
            negotiation,
            won,
            lost,
          ]}
          animated={graphAnimated}
        />
      </section>

      {/* REVENUE + FOLLOW-UP ANALYTICS */}
      <section className="analytics-row">
        <div className="card revenue-card">
          <div className="card-header">
            <div>
              <span className="section-kicker">REVENUE ANALYTICS</span>
              <h2>Pipeline Health</h2>
            </div>
            <span className="analytics-badge">Live</span>
          </div>

          <div className="revenue-summary">
            <div>
              <span>Active Pipeline</span>
              <strong>{formatCurrency(pipelineValue)}</strong>
            </div>
            <div>
              <span>Won Value</span>
              <strong>{formatCurrency(wonValue)}</strong>
            </div>
          </div>

          <div className="revenue-track">
            <div
              className="revenue-fill"
              style={{ width: `${pipelineValue > 0 ? Math.min((wonValue / pipelineValue) * 100, 100) : 0}%` }}
            ></div>
          </div>
          <div className="revenue-foot">
            <span>{conversionRate}% overall conversion</span>
            <span>{formatCurrency(Math.max(pipelineValue - wonValue, 0))} remaining</span>
          </div>
        </div>

        <div className="card followup-card">
          <div className="card-header">
            <div>
              <span className="section-kicker">FOLLOW-UP CENTER</span>
              <h2>Attention Required</h2>
            </div>
            <span className={`attention-badge ${overdueFollowUps > 0 ? "danger" : "safe"}`}>
              {overdueFollowUps > 0 ? `${overdueFollowUps} overdue` : "On track"}
            </span>
          </div>

          <div className="followup-stats">
            <div className="followup-stat overdue">
              <span>Overdue</span>
              <strong>{overdueFollowUps}</strong>
            </div>
            <div className="followup-stat today">
              <span>Due Today</span>
              <strong>{Math.max(followUps - overdueFollowUps, 0)}</strong>
            </div>
            <div className="followup-stat upcoming">
              <span>Upcoming</span>
              <strong>{upcomingFollowUps}</strong>
            </div>
          </div>

          <button className="analytics-link" onClick={() => navigate("enquiries")}>
            Review follow-ups →
          </button>
        </div>
      </section>

      {/* RECENT */}
      <section className="card recent-card">
        <div className="card-header">
          <div>
            <span className="section-kicker">
              LATEST ACTIVITY
            </span>
            <h2>Recent Enquiries</h2>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("enquiries")}
          >
            View all →
          </button>
        </div>

        {recentEnquiries.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="Create your first business enquiry."
            buttonText="Create Enquiry"
            onClick={openCreateForm}
          />
        ) : (
          <div className="recent-list">
            {recentEnquiries.map((item, index) => (
              <div
                className="recent-row"
                key={item.id}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
                onClick={() => handleView(item.id)}
              >
                <div className="company-avatar">
                  {initials(item.clientCompanyName)}
                </div>

                <div className="recent-main">
                  <strong>{item.clientCompanyName}</strong>
                  <span>
                    {item.contactPerson} ·{" "}
                    {item.serviceRequirement}
                  </span>
                </div>

                <span
                  className={`status-pill ${statusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <strong className="recent-budget">
                  {formatCurrency(item.estimatedBudget)}
                </strong>

                <span className="arrow">→</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   ANIMATED PIPELINE GRAPH
========================================================= */

function AnimatedPipelineGraph({ values, animated }) {
  const labels = [
    "New",
    "Contacted",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];

  const maxValue = Math.max(...values, 1);
  const chartHeight = 190;
  const chartWidth = 720;
  const left = 46;
  const right = 18;
  const top = 18;
  const bottom = 34;
  const innerWidth = chartWidth - left - right;
  const innerHeight = chartHeight - top - bottom;
  const step = innerWidth / (values.length - 1);

  const points = values.map((value, index) => {
    const x = left + index * step;
    const y = top + innerHeight - (value / maxValue) * innerHeight;
    return { x, y, value };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${points[0].x},${top + innerHeight}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1].x},${top + innerHeight}`,
  ].join(" ");

  return (
    <div className={`graph-container ${animated ? "graph-show" : ""}`}>
      <div className="graph-chart">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Enquiry flow analytics graph"
          preserveAspectRatio="none"
        >
          {[0, 1, 2, 3].map((row) => {
            const y = top + (innerHeight / 3) * row;
            return (
              <line
                key={row}
                x1={left}
                x2={chartWidth - right}
                y1={y}
                y2={y}
                className="graph-grid-line"
              />
            );
          })}

          <polygon points={areaPoints} className="graph-area" />

          <polyline
            points={linePoints}
            className="graph-line"
            pathLength="1000"
          />

          {points.map((point, index) => (
            <g
              key={labels[index]}
              className="graph-point-group"
              style={{ "--point-delay": `${index * 90}ms` }}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                className="graph-point"
              />
              <text
                x={point.x}
                y={chartHeight - 9}
                textAnchor="middle"
                className="graph-label"
              >
                {labels[index]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="graph-stats">
        {values.map((value, index) => (
          <div
            className="graph-stat"
            key={labels[index]}
            style={{ "--stat-delay": `${index * 80}ms` }}
          >
            <span>{labels[index]}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  className,
  currency,
}) {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-icon">{icon}</div>

      <div className="metric-content">
        <span>{title}</span>

        <strong className={currency ? "currency-value" : ""}>
          {value}
        </strong>

        <small>{subtitle}</small>
      </div>

      <div className="metric-glow"></div>
    </div>
  );
}

/* =========================================================
   INSIGHT
========================================================= */

function Insight({ icon, title, value }) {
  return (
    <div className="insight">
      <div className="insight-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}

/* =========================================================
   ENQUIRIES PAGE
========================================================= */

function EnquiriesPage({
  enquiries,
  filteredEnquiries,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  assignedFilter,
  setAssignedFilter,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  followUpFilter,
  setFollowUpFilter,
  clearFilters,
  exportCSV,
  loading,
  error,
  openCreateForm,
  openEditForm,
  handleView,
  handleDelete,
  formatCurrency,
  initials,
  statusClass,
}) {
  return (
    <div className="page-enter">
      <section className="page-heading">
        <div>
          <span className="eyebrow">CRM RECORDS</span>
          <h1>Business Enquiries</h1>
          <p>
            Manage and track every client enquiry from one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          ＋ New Enquiry
        </button>
      </section>

      <section className="card filters-card">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, email or service..."
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
        </select>

        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option>All Sources</option>
          {SOURCE_OPTIONS.map((source) => <option key={source}>{source}</option>)}
        </select>

        <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
          <option>All Assigned</option>
          {[...new Set(enquiries.map((item) => item.assignedPerson).filter(Boolean))].map((person) => (
            <option key={person}>{person}</option>
          ))}
        </select>

        <select value={followUpFilter} onChange={(e) => setFollowUpFilter(e.target.value)}>
          <option>All Follow-ups</option>
          <option>Overdue</option>
          <option>Due Today</option>
          <option>Upcoming</option>
          <option>No Date</option>
        </select>

        <input
          className="budget-filter"
          type="number"
          min="0"
          value={minBudget}
          onChange={(e) => setMinBudget(e.target.value)}
          placeholder="Min budget"
        />

        <input
          className="budget-filter"
          type="number"
          min="0"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          placeholder="Max budget"
        />

        <button className="clear-button" onClick={clearFilters}>Clear</button>
        <button className="export-button" onClick={exportCSV}>↓ Export CSV</button>
      </section>

      <section className="card table-card">
        <div className="table-top">
          <div>
            <h2>All Enquiries</h2>
            <span>
              Showing {filteredEnquiries.length} of{" "}
              {enquiries.length} records
            </span>
          </div>

          <div className="table-count">
            {filteredEnquiries.length} Results
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredEnquiries.length === 0 ? (
          <EmptyState
            title="No matching enquiries"
            description="Try changing your search or filters."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>SERVICE</th>
                  <th>SOURCE</th>
                  <th>BUDGET</th>
                  <th>STATUS</th>
                  <th>ASSIGNED</th>
                  <th>FOLLOW-UP</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredEnquiries.map((item, index) => (
                  <tr
                    key={item.id}
                    className="table-row"
                    style={{
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    <td>
                      <div className="client-cell">
                        <div className="company-avatar small">
                          {initials(item.clientCompanyName)}
                        </div>

                        <div>
                          <strong>
                            {item.clientCompanyName}
                          </strong>

                          <span>
                            {item.contactPerson}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="service-text">
                        {item.serviceRequirement}
                      </span>
                    </td>

                    <td>
                      <span className="source-text">
                        {item.enquirySource}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          item.estimatedBudget
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-pill ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <span className="assigned">
                        {item.assignedPerson || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="followup">
                        {item.nextFollowUpDate || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleView(item.id)}
                          title="View"
                        >
                          👁
                        </button>

                        <button
                          onClick={() => openEditForm(item)}
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          className="delete-action"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   PIPELINE PAGE
========================================================= */

function PipelinePage({
  enquiries,
  formatCurrency,
  initials,
  statusClass,
  handleView,
}) {
  const stages = STATUS_OPTIONS;

  return (
    <div className="page-enter">
      <section className="page-heading">
        <div>
          <span className="eyebrow">SALES MANAGEMENT</span>
          <h1>Enquiry Pipeline</h1>
          <p>
            Move opportunities through every stage of your sales
            journey.
          </p>
        </div>
      </section>

      <div className="pipeline-board">
        {stages.map((stage, stageIndex) => {
          const stageItems = enquiries.filter(
            (item) => item.status === stage
          );

          const stageValue = stageItems.reduce(
            (sum, item) =>
              sum + Number(item.estimatedBudget || 0),
            0
          );

          return (
            <div
              className={`pipeline-column ${statusClass(
                stage
              )}`}
              key={stage}
              style={{
                animationDelay: `${stageIndex * 80}ms`,
              }}
            >
              <div className="column-header">
                <div>
                  <span className="column-dot"></span>
                  <strong>{stage}</strong>
                </div>

                <span className="column-count">
                  {stageItems.length}
                </span>
              </div>

              <div className="column-value">
                {formatCurrency(stageValue)}
              </div>

              <div className="pipeline-items">
                {stageItems.length === 0 ? (
                  <div className="pipeline-empty">
                    No enquiries
                  </div>
                ) : (
                  stageItems.map((item) => (
                    <div
                      className="pipeline-item"
                      key={item.id}
                      onClick={() => handleView(item.id)}
                    >
                      <div className="pipeline-client">
                        <div className="company-avatar tiny">
                          {initials(
                            item.clientCompanyName
                          )}
                        </div>

                        <div>
                          <strong>
                            {item.clientCompanyName}
                          </strong>

                          <span>
                            {item.contactPerson}
                          </span>
                        </div>
                      </div>

                      <div className="pipeline-item-bottom">
                        <span>
                          {item.serviceRequirement}
                        </span>

                        <strong>
                          {formatCurrency(
                            item.estimatedBudget
                          )}
                        </strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

function EnquiryModal({
  form,
  handleChange,
  handleSubmit,
  setShowForm,
  editingId,
  saving,
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={() => setShowForm(false)}
    >
      <div
        className="modal large-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {editingId ? "UPDATE RECORD" : "NEW RECORD"}
            </span>

            <h2>
              {editingId
                ? "Edit Enquiry"
                : "Create New Enquiry"}
            </h2>

            <p>
              Enter the client and sales information below.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={() => setShowForm(false)}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">
              Client Information
            </div>

            <div className="form-grid">
              <Field
                label="Client / Company Name"
                name="clientCompanyName"
                value={form.clientCompanyName}
                onChange={handleChange}
                required
              />

              <Field
                label="Contact Person"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                required
              />

              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Enquiry Details
            </div>

            <div className="form-grid">
              <SelectField
                label="Enquiry Source"
                name="enquirySource"
                value={form.enquirySource}
                onChange={handleChange}
                options={SOURCE_OPTIONS}
              />

              <Field
                label="Service / Requirement"
                name="serviceRequirement"
                value={form.serviceRequirement}
                onChange={handleChange}
                required
              />

              <Field
                label="Estimated Budget"
                name="estimatedBudget"
                type="number"
                value={form.estimatedBudget}
                onChange={handleChange}
                required
              />

              <Field
                label="Next Follow-up Date"
                name="nextFollowUpDate"
                type="date"
                value={form.nextFollowUpDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field full">
              <label>Requirement Description</label>

              <textarea
                name="requirementDescription"
                value={form.requirementDescription}
                onChange={handleChange}
                placeholder="Describe the client's requirement..."
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              Sales Management
            </div>

            <div className="form-grid">
              <SelectField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
              />

              <Field
                label="Assigned Person"
                name="assignedPerson"
                value={form.assignedPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field full">
              <label>Additional Notes</label>

              <textarea
                name="additionalNotes"
                value={form.additionalNotes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Enquiry"
                : "Create Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}) {
  return (
    <div className="field">
      <label>
        {label}
        {required && <span>*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   VIEW MODAL
========================================================= */

function ViewModal({
  enquiry,
  setShowView,
  openEditForm,
  formatCurrency,
  statusClass,
  initials,
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={() => setShowView(false)}
    >
      <div
        className="modal view-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="view-header">
          <div className="company-avatar large">
            {initials(enquiry.clientCompanyName)}
          </div>

          <div className="view-title">
            <span className="eyebrow">
              ENQUIRY #{enquiry.id}
            </span>

            <h2>{enquiry.clientCompanyName}</h2>

            <p>{enquiry.contactPerson}</p>
          </div>

          <button
            className="modal-close"
            onClick={() => setShowView(false)}
          >
            ×
          </button>
        </div>

        <div className="view-status">
          <span
            className={`status-pill ${statusClass(
              enquiry.status
            )}`}
          >
            {enquiry.status}
          </span>

          <strong>
            {formatCurrency(enquiry.estimatedBudget)}
          </strong>
        </div>

        <div className="details-grid">
          <Detail
            label="Email"
            value={enquiry.email}
          />

          <Detail
            label="Phone"
            value={enquiry.phone}
          />

          <Detail
            label="Source"
            value={enquiry.enquirySource}
          />

          <Detail
            label="Service"
            value={enquiry.serviceRequirement}
          />

          <Detail
            label="Assigned Person"
            value={enquiry.assignedPerson}
          />

          <Detail
            label="Follow-up"
            value={enquiry.nextFollowUpDate}
          />
        </div>

        <div className="detail-description">
          <span>Requirement Description</span>
          <p>
            {enquiry.requirementDescription ||
              "No description provided."}
          </p>
        </div>

        <div className="detail-description">
          <span>Additional Notes</span>
          <p>
            {enquiry.additionalNotes ||
              "No additional notes."}
          </p>
        </div>

        <div className="modal-footer">
          <button
            className="secondary-button"
            onClick={() => setShowView(false)}
          >
            Close
          </button>

          <button
            className="primary-button"
            onClick={openEditForm}
          >
            Edit Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

/* =========================================================
   STATES
========================================================= */

function LoadingState() {
  return (
    <div className="state-box">
      <div className="spinner"></div>
      <strong>Loading enquiries...</strong>
      <span>Fetching the latest CRM records.</span>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="state-box error-state">
      <div className="state-icon">!</div>
      <strong>Something went wrong</strong>
      <span>{message}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  buttonText,
  onClick,
}) {
  return (
    <div className="state-box">
      <div className="state-icon">○</div>

      <strong>{title}</strong>

      <span>{description}</span>

      {buttonText && (
        <button
          className="primary-button small"
          onClick={onClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   CSS
========================================================= */


export default App;