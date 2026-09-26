import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";
import { Link } from "react-router-dom";

function Admin() {
  const { user, token } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard"
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-page__loading">
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <div className="admin-page__error">
          <h1>Unable to load dashboard</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const stats = dashboard?.stats || {};
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <main className="admin-page">
      <div className="admin-page__container">

        {/* Header */}
        <header className="admin-page__header">
          <div>
            <p className="admin-page__eyebrow">
              CERESEA ADMIN
            </p>

            <h1>
              Welcome back,
              <span>{user?.name}</span>
            </h1>
          </div>

          <div className="admin-page__admin-info">
            <span>ADMIN</span>
            <p>{user?.email}</p>
          </div>
        </header>

        {/* Statistics */}
        <section className="admin-stats">
          <div className="admin-stat">
            <span>Total Orders</span>
            <strong>{stats.totalOrders || 0}</strong>
          </div>

          <div className="admin-stat">
            <span>Paid Orders</span>
            <strong>{stats.paidOrders || 0}</strong>
          </div>

          <div className="admin-stat">
            <span>Processing</span>
            <strong>
              {stats.processingOrders || 0}
            </strong>
          </div>

          <div className="admin-stat">
            <span>Revenue</span>
            <strong>
              ₹{stats.revenue || 0}
            </strong>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="admin-orders">
        <Link
  to="/admin/orders"
  className="admin-view-all"
>
  View All Orders →
</Link>
          <div className="admin-section-header">
            <div>
              <p className="admin-page__eyebrow">
                OVERVIEW
              </p>

              <h2>Recent Orders</h2>
            </div>

            <span>
              Latest {recentOrders.length}
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="admin-empty">
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="admin-orders__table-wrapper">
              <table className="admin-orders__table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </strong>
                      </td>

                      <td>
                        <div className="admin-customer">
                          <strong>
                            {order.contact.fullName}
                          </strong>

                          <span>
                            {order.contact.email}
                          </span>
                        </div>
                      </td>

                      <td>
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td>
                        <strong>
                          ₹{order.totalAmount}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-badge admin-badge--${order.paymentStatus}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-badge admin-badge--${order.orderStatus}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default Admin;