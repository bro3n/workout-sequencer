export function usePwa() {
  const needsRefresh = ref(false);

  const updateServiceWorker = () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    });
  };

  onMounted(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      // Détecte un nouveau SW en cours d'installation
      const onUpdateFound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            needsRefresh.value = true;
          }
        });
      };

      registration.addEventListener("updatefound", onUpdateFound);

      // Vérifie s'il y a déjà un SW en attente (ex: onglet rouvert)
      if (registration.waiting && navigator.serviceWorker.controller) {
        needsRefresh.value = true;
      }
    });
  });

  return { needsRefresh, updateServiceWorker };
}
