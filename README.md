## Getting Started

Before we start, if you're reading this from a ZIP File, know that you can also find this App on Github at https://github.com/jrmccarthy/manapool.

First, you'll want to install Node and NPM (and I recommend PNPM). Honestly I'd recommend consulting Node's website for this because its not easily done through things like Apt or other OS Package managers.

Next, install all the deps:

```bash
pnpm install
```

Finally, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Using the app

Its a simple app that just displays items from your ManaPool inventory in a poorly styled table.

To use it, enter your ManaPool email and API Access Key into the fields at the top, and then press Load Inventory. The app should (via a proxy to the NextJS backend to avoid CORS issues) make a request to ManaPool's seller inventory page, and then it should dump a bunch of basic data about your inventory to the screen.

# IMPORTANT

This was working fine on my account... at first. Then I decided to add a Glaring Fleshraker to my account, to increase the number of cards. At that point, I believe the ManaPool API stopped sending me valid data if I asked for GZIP Compression and started sending broken responses, which of course broke the App's display.

I troubleshooted this for a while, copying requests into CURL and playing around with the headers, and even "deleted" (set to zero) my fleshrakers and added a new card to no avail. With CURL, I am able to get back properly formatted data if I either don't ask for compression, or specify `deflate` as my `accept-encoding`. If I ask for compression and include `gzip` in `accept-encoding`, CURL cannot process the response either and gives me a parsing error. This meant that I could access the API with CURL without error.

However, `accept-encoding` is a so-called [Forbidden Request Header](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_request_header). In a nutshell, I'm not allowed to tell my web app to set those because they are reserved for the User Agent (the browser), so I can't really fix this problem, at least I could not with some time troubleshooting and using Typescript's `fetch` API. I'll admit that I'm definitely more knowledgable about Python than Javascript internals, so maybe I could have hacked my way around it there, but with cursory efforts did not produce any results.

So I promise the app DOES work, but only if the server returns a parsable response (which in this case would suggest the server returning a non-gzipped response, or getting fixed, or whatever horrible curse has befallen my user account getting fixed). Pretty cool, eh?

Oh, and one other unexpected behavior I encounted while I was fiddling with requests: the API does not seem to like when I request exactly `limit=2` items. It caused my requests to hang for a while (from the API test page, it took around 12 seconds to return in one test). This is on my same account, under my email, which has 2 cards with quantity > 0. I can't really guess as to the cause without seeing the server code but I found it an unexpected behavior.
