export default defineAppConfig({
    ui: {
        colors: {
            primary: 'kleeja',
            neutral: 'zinc'
        }
    },
    header: {
        title: 'Kleeja',
        logo: {
            light: '/images/logo.svg',
            dark: '/images/logo-light.svg',
            alt: 'Kleeja Logo',
            class: 'h-10!',
        },
    },
    // The GitHub icon in the header and footer points at Kleeja itself, not at
    // this documentation site. `github` stays on the repo Docus infers from the
    // git remote (kleeja/website) because that is what the "Edit this
    // page" and "Report an issue" links at the bottom of each page are for.
    socials: {
        github: 'https://github.com/kleeja/kleeja',
    },
});
