// Simple helper to load an external script at runtime and resolve once it's available
export default function loadExternalScript(url: string, globalName?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // If global already present, resolve immediately
      if (globalName && (window as any)[globalName]) {
        resolve((window as any)[globalName]);
        return;
      }

      const existing = Array.from(document.getElementsByTagName('script')).find((s) => s.src === url);
      if (existing) {
        existing.addEventListener('load', () => {
          if (globalName) {
            resolve((window as any)[globalName]);
          } else {
            resolve(true);
          }
        });
        existing.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        if (globalName) {
          resolve((window as any)[globalName]);
        } else {
          resolve(true);
        }
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
}
