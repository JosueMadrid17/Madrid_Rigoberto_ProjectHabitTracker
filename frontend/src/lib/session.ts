export class Session {
  private static readonly TOKEN_KEY = "access_token";
  private static readonly USER_KEY = "usuario";

  static guardarSesion(token: string, usuario: unknown) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  static obtenerToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static obtenerUsuario<T = any>(): T | null {
    if (typeof window === "undefined") return null;

    const usuario = sessionStorage.getItem(this.USER_KEY);
    if (!usuario) return null;
    try {
      return JSON.parse(usuario) as T;
    } catch {
      return null;
    }
  }

  static cerrarSesion() {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  static estaAutenticado(): boolean {
    return Boolean(this.obtenerToken());
  }
}
