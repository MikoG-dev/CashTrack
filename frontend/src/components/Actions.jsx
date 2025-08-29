export default function Actions() {
  return (
    <div className="ms-auto dropdown">
      <button
        className="btn btn-light dropdown-toggle"
        type="button"
        id="accountDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="bi bi-person-circle fs-4"></i> {/* Bootstrap Icons */}
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby="accountDropdown"
      >
        <li>
          <button className="dropdown-item" onClick={() => {}}>
            Logout
          </button>
        </li>
        <li>
          <button className="dropdown-item">Profile</button>
        </li>
      </ul>
    </div>
  );
}
