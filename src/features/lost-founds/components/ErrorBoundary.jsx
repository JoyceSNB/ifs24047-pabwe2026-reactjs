import { Component } from "react";

// Menangkap error saat render (misalnya file halaman gagal diunduh) supaya
// layar tidak kosong. Tampilan cadangan tetap punya <main> dan <h1>.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
          <div className="max-w-sm text-center" role="alert">
            <h1 className="font-display text-2xl font-extrabold text-slate-800">
              Halaman gagal dimuat
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Periksa koneksi internet kamu, lalu muat ulang halaman ini.
            </p>
            <a
              href={window.location.pathname}
              data-testid="error-reload-link"
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900"
            >
              Muat ulang halaman
            </a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;