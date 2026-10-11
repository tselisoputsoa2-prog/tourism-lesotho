# Lesotho Tourism Website
Web Design 1 (DIWD2110) - Assignment 2

A responsive, six-page tourism website for Lesotho, built with HTML5, CSS3, Bootstrap 5.3 and JavaScript.
Colours come from the national flag: blue `#00209F`, green `#009543`, white, and the black Mokorotlo hat, with a Basotho-blanket gold `#e0a526` as accent.

## Folder structure
```
lesotho-tourism/
  index.html            Home (hero, featured places, seasons carousel, FAQ accordion)
  destinations.html     25 places: search, category filter, sort, pagination, details modal, saved places
  accommodation.html    6 stays, comparison table, stay cost calculator, booking tips accordion
  activities.html       6 activities with filter + search, seasons table
  gallery.html          24 labelled photographs in a simple grid
  contact.html          Booking form (live cost estimate), contact form, traveller sign-up form
  css/style.css         All custom styling, organised in 12 numbered sections
  js/                   main.js, home.js, destinations.js, gallery.js, activities.js, stays.js, forms.js, data-fallback.js
  data/destinations.json  The 25 destinations (loaded with fetch)
  images/               photographs (.jpg), logo.svg, favicon.svg  (see IMAGE-CHECKLIST.txt)
```

## Where each requirement is met
| Requirement | Where |
|---|---|
| Semantic HTML5 (header, nav, main, section, article, aside, footer) | every page |
| 5+ interconnected pages | 6 pages, shared navbar and footer |
| Tables, lists, forms, HTML5 input types, alt text | accommodation, activities, contact |
| Bootstrap layout + breakpoints (sm, md, lg, xl, xxl) | grid classes on every page |
| Bootstrap components (11 used) | Navbar, Cards, Carousel, Modal, Accordion, Alerts, Buttons, Forms, Pagination, Dropdown, Badges |
| JavaScript features (9) | form validation, gallery lightbox, search, filtering, dynamic content, dark/light mode, interactive nav, booking calculator, stay calculator |
| Advanced features | localStorage (theme, username, saved places, bookings), JSON data + Fetch API, DOM manipulation, modals, accordion |
| Forms | Booking, Contact, Sign-up: HTML5 attributes + JS validation, error and success messages |
| Accessibility | skip link, labels, aria-live, focus styles, contrast, reduced-motion support |

`localStorage` example: after signing up on `contact.html`, `localStorage.setItem("lt_username", ...)` saves the name and every page greets you with it. Use "Sign out" to remove it.

## Run it on your computer
Open `index.html` in a browser. If `fetch()` is blocked when opening files directly, the site automatically uses `js/data-fallback.js`, so it still works. For the cleanest test, run `python -m http.server` inside this folder and open http://localhost:8000.

## Host it free on GitHub Pages
1. Create a new public repository on github.com, for example `lesotho-tourism`.
2. Upload everything inside this folder (drag the files in, or use `git add . && git commit && git push`).
3. In the repository go to Settings, then Pages. Under "Build and deployment" choose Branch `main` and folder `/ (root)`, then Save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/lesotho-tourism/`.
5. Submit the repository link (source code) and the Pages link (hosted site).

## Photographs
The site uses real photographs saved in `images/`. File names are case-sensitive on GitHub Pages, so they must match the names in `IMAGE-CHECKLIST.txt` exactly. The destination cards on `destinations.html` read their picture paths from `data/destinations.json` and `js/data-fallback.js`; keep those two files in step if you rename a photo.

## Notes
* Bootstrap, Bootstrap JS and Google Fonts load from CDNs, so you need an internet connection the first time.
* Prices, addresses and the contact details are sample content for this student project.
