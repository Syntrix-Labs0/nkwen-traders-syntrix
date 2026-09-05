PRE-LAUNCH SECURITY MEMO

Project: Nkwen Trader Website
Assessment Type: Pre-Launch Security Review
Assessment Status: Preliminary
Date: September 5, 2026
Prepared By: Security Reviewer


1. Executive Summary

A preliminary security assessment was conducted on the Nkwen e-commerce website before deployment.

The application is currently a frontend-only web application built using HTML, CSS, and JavaScript. At the time of assessment, it does not contain a backend server, database, user authentication system, or integrated payment-processing system.

Testing identified two security issues within the shopping-cart functionality:

A. Client-Side Price Manipulation
B. Client-Side HTML Injection

The findings demonstrate that important shopping-cart data is currently controlled by the browser and can be modified by a user.

Because the application currently has no backend or real payment processing, the observed issues do not currently demonstrate unauthorized financial transactions. However, they become significantly more serious if the application is later connected to an ordering, payment, inventory, or fulfillment backend.

Preliminary Recommendation: CONDITIONAL GO

The application should not be considered security-ready for real transactions until server-side validation and appropriate security controls are implemented when backend functionality is introduced.


2. Application Overview

The application is currently composed of:

- HTML
- CSS
- JavaScript
- Client-side shopping-cart functionality
- Browser "localStorage" for cart persistence
- Static product information
- Frontend order confirmation

The current order process does not perform actual payment processing or communicate with a backend service.


3. Scope of Assessment

The preliminary assessment focused primarily on the client-side application and shopping-cart functionality.

Areas reviewed

- Shopping-cart functionality
- Browser "localStorage"
- Client-side price calculations
- Client-side quantity manipulation
- DOM rendering
- Handling of user-controlled data
- Order confirmation logic
- Potential exposure of sensitive information


4. Security Findings

Finding A — Client-Side Price Manipulation

Severity: Medium — potentially High if payment processing is introduced

Affected Component: Shopping Cart

Attack Surface: Browser "localStorage" ("nkwenCart")

Description

The shopping cart stores product information, including product prices, in the browser's "localStorage".

During testing, the stored price of a product was manually modified in "localStorage". After returning to the cart, the application accepted the modified price and recalculated the cart total using the manipulated value.

The application therefore currently trusts price information controlled by the client.

Technical Root Cause

The cart retrieves product information directly from "localStorage".

The total is calculated using the stored client-side price:

"quantity × price"

The "placeOrder()" function then uses this calculated value without server-side validation.

Potential Impact

A user can manipulate the price stored in their browser and cause the displayed cart total to differ from the intended product price.

At the current stage, this does not demonstrate financial loss because the application does not perform an actual payment transaction.

However, if the application is connected to a backend or payment system and continues trusting client-supplied prices, an attacker could potentially submit an order containing manipulated pricing.

Recommendation

When backend functionality is introduced:

- Never trust prices supplied by the browser.
- Store authoritative product prices on the server.
- Identify products using trusted product IDs.
- Retrieve current prices from the server/database.
- Calculate the order total server-side.
- Validate quantities and product availability server-side.
- Send only trusted server-calculated totals to the payment system.

Security principle: The browser should be treated as an untrusted environment.


Finding B — Client-Side HTML Injection

Severity: Medium / XSS Status To Be Confirmed

Affected Component: Shopping Cart

Attack Surface: Product name stored in "localStorage"

Description

The shopping cart dynamically constructs HTML using values retrieved from browser "localStorage".

During testing, the product name stored in "nkwenCart" was changed from:

"Bread"

to:

"<u>SECURITY TEST</u>"

When the cart page was opened, the text was rendered with an underline.

This confirms that HTML markup supplied through the stored product name is being interpreted by the browser.

Technical Root Cause

The application uses "innerHTML" to construct the cart interface.

For example, product information is inserted into the HTML using values such as:

"item.name"

Because these values are inserted as HTML rather than plain text, specially crafted markup can be interpreted by the browser.

Potential Impact

An attacker who can influence the stored cart data may be able to inject HTML into the cart interface.

At this stage, the testing confirms HTML injection, but does not by itself prove arbitrary JavaScript execution or Cross-Site Scripting (XSS).

Further controlled testing would be required before formally classifying this as XSS.

Recommendation

Avoid inserting untrusted values using "innerHTML".

For values that should only contain text, such as product names, use safe DOM APIs such as:

"textContent"

Untrusted data should be treated as data rather than executable or renderable HTML.

Any future backend-supplied product information should also be validated and safely encoded before being inserted into the page.


5. Additional Security Areas Requiring Review

Before production deployment, the following areas should also be reviewed.

5.1 HTTPS / Transport Security

The production website should use HTTPS.

HTTP should not be used for transmitting sensitive information.

Once the hosting environment is selected, TLS configuration should be reviewed.



5.2 Repository Security

The source-code repository should be reviewed before deployment.

Recommended controls include:

- Protected main branch
- Pull-request review
- Appropriate branch permissions
- Secret scanning
- Removal of unnecessary sensitive files
- Controlled access for team members


6. Security Testing Recommendations

Before production launch, the following testing should be performed:

Client-side testing

- Local storage manipulation
- DOM-based injection testing
- Input validation testing
- JavaScript security review
- Dependency review
- Browser developer-tool inspection

Deployment testing

- HTTPS verification
- TLS configuration review
- Security-header verification
- Directory/file exposure testing
- Production configuration review


7. Conclusion

The preliminary assessment identified weaknesses in the current client-side shopping-cart implementation.

The most significant observation is that the browser currently controls data that would become security-sensitive in a real e-commerce environment.

The identified issues are manageable at the current development stage, but they must be addressed before the application relies on client-controlled information for real transactions.

Once backend functionality, authentication, APIs, or payment processing are introduced, a new security assessment should be performed because the application's attack surface will substantially increase.


Security Review Sign-Off

Reviewer: NKWA FORTUNE ABANG

Role: Security Reviewer

Date: 05/09/2026

Status: Conditional Go

Developer/Project Owner: THE SYNTRIX - RESEARCH TEAM

Acknowledgement: _________________________________