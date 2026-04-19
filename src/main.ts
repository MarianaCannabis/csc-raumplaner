// P1 entry — loaded alongside the legacy inline script in index.html.
// Modules under src/ live here; legacy globals stay in index.html until
// they get strangled one by one.
console.info('[csc] vite entry alive', import.meta.env.MODE);
