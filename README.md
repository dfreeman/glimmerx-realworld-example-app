# ![glimmerx-realworld-example-app](header.png)

This repo is a [GlimmerX](https://github.com/glimmerjs/glimmer-experimental) implementation of the [RealWorld](https://github.com/gothinkster/realworld) example application [Conduit](https://demo.realworld.io/). It uses [Glint](https://github.com/typed-ember/glint) for template-aware end to end typechecking.

Unlike most RealWorld example apps, this one doesn't set out to be an exemplary demonstration of best practices for working with the tool of choice, as no such best practices exist for GlimmerX. Most of the patterns employed were things I made up on the spot, but "experimental" is right in the name of the library, so be warned that Here There Be Dragons.

A [live version of this application](https://dfreeman.github.io/glimmerx-realworld-example-app) is deployed to this repo's `gh-pages` branch.

Most of the remainder of this README is the standard RealWorld boilerplate describing the app's capabilities and how to get up and running locally.

## Functionality overview

The example application is a social blogging site (i.e. a Medium.com clone) called "Conduit". It uses a custom API for all requests, including authentication. You can view a live demo over at https://dfreeman.github.io/glimmerx-realworld-example-app

**General functionality:**

- Authenticate users via JWT (login/signup pages + logout button on settings page)
- CRU\* users (sign up & settings page - no deleting required)
- CRUD Articles
- CR\*D Comments on articles (no updating required)
- GET and display paginated lists of articles
- Favorite articles
- Follow other users

**The general page breakdown looks like this:**

- Home page (URL: /#/ )
  - List of tags
  - List of articles pulled from either Feed, Global, or by Tag
  - Pagination for list of articles
- Sign in/Sign up pages (URL: /#/login, /#/register )
  - Uses JWT (store the token in localStorage)
  - Authentication can be easily switched to session/cookie based
- Settings page (URL: /#/settings )
- Editor page to create/edit articles (URL: /#/editor, /#/editor/article-slug-here )
- Article page (URL: /#/article/article-slug-here )
  - Delete article button (only shown to article's author)
  - Render markdown from server client side
  - Comments section at bottom of page
  - Delete comment button (only shown to comment's author)
- Profile page (URL: /#/profile/:username, /#/profile/:username/favorites )
  - Show basic user info
  - List of articles populated from author's created articles or author's favorited articles
