<p align="center"><img src="https://www.11ty.dev/img/logo-github.png" alt="eleventy Logo"></p>

# eleventy-plugin-directory-output

Group and sort [Eleventy](https://github.com/11ty/eleventy)’s verbose output by directory (and show file size with benchmarks).

Sample output from `eleventy-base-blog`:

```
> eleventy-base-blog@6.0.0 build
> eleventy

↘ _site/                               --                           --       --
  → about/index.html                   about/index.md            1.8kB    2.7ms
  ↘ feed/                              --                           --       --
    • .htaccess                        feed/htaccess.njk         0.1kB    0.2ms
    • feed.json                        feed/json.njk           106.8kB   17.3ms
    • feed.xml                         feed/feed.njk           109.8kB    9.8ms
  → page-list/index.html               page-list.njk             3.2kB    1.1ms
  ↘ posts/                             --                           --       --
    → firstpost/index.html             posts/firstpost.md        3.5kB    1.0ms
    → fourthpost/index.html            posts/fourthpost.md     101.0kB   27.2ms
    → secondpost/index.html            posts/secondpost.md       3.2kB    5.6ms
    → thirdpost/index.html             posts/thirdpost.md        4.5kB    7.5ms
    • index.html                       archive.njk               3.0kB   13.7ms
  ↘ tags/                              --                           --       --
    → another-tag/index.html           tags.njk                  2.1kB    0.9ms
    → number-2/index.html              tags.njk                  2.1kB    0.4ms
    → posts-with-two-tags/index.html   tags.njk                  2.3kB    0.2ms
    → second-tag/index.html            tags.njk                  2.5kB    0.5ms
    • index.html                       tags-list.njk             2.0kB    0.4ms
  • 404.html                           404.md                    1.9kB    0.4ms
  • index.html                         index.njk                 2.8kB    1.7ms
  • sitemap.xml                        sitemap.xml.njk           1.4kB    1.3ms
[11ty] Copied 3 files / Wrote 18 files in 0.16 seconds (8.9ms each, v1.0.1)
```

## [The full `eleventy-plugin-directory-output` documentation is on 11ty.dev](https://www.11ty.dev/docs/plugins/directory-output/).

* _This is a plugin for the [Eleventy static site generator](https://www.11ty.dev/)._
* Find more [Eleventy plugins](https://www.11ty.dev/docs/plugins/).
* Please star [Eleventy on GitHub](https://github.com/11ty/eleventy/), follow [@eleven_ty](https://twitter.com/eleven_ty) on Twitter, and support [11ty on Open Collective](https://opencollective.com/11ty)

[![npm Version](https://img.shields.io/npm/v/@11ty/eleventy-plugin-directory-output.svg?style=for-the-badge)](https://www.npmjs.com/package/@11ty/eleventy-plugin-directory-output) [![GitHub issues](https://img.shields.io/github/issues/11ty/eleventy-plugin-directory-output.svg?style=for-the-badge)](https://github.com/11ty/eleventy-plugin-directory-output/issues)

## Installation

```
npm install @11ty/eleventy-plugin-directory-output
```

_[The full `eleventy-plugin-directory-output` documentation is on 11ty.dev](https://www.11ty.dev/docs/plugins/directory-output/)._

