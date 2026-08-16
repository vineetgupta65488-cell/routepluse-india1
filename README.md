# RoutePulse India

A new standalone bus-tracking website for India.

## Included
- Government Buses route search with bus number, journey time and fare fields.
- Organisation registration with generated unique passenger code.
- Admin login using organisation email and password.
- Admin bus creation with driver, phone, route, start/end, stops and schedule.
- Driver GPS permission and current location capture.
- Passenger organisation-code lookup and live-location display.
- Responsive mobile/desktop UI.

## Run
Open `index.html` in a browser or enable GitHub Pages for this repository.

## Important
This version is a frontend prototype. Data is stored in browser local storage, so it is not a shared production database. GPS captures the current device location while the page is active. For true cross-device real-time tracking, add a backend such as Firebase/Supabase and verified government/operator feeds.
