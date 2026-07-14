## Description

- news actu
- conseils des ministres
- journal officiel ?

un post peut être liée à des fichier pdf à télécharger ?

https://www.youtube.com/watch?v=eHsCXPMt0HQ&list=PLD--x9rY3ZL18tlVM2ljEuCA1ml3qaiE4&index=3

## Structure

- Content

  - pages
  - blog_catgories
    - title
    - slug (conseil-ministre, conseil-interministeriel, discours, article)
  - blog_seo
    - title
    - canonical_url
    - meta_description (textarea)
    - no_follow (boolean)
    - no_index (boolean)
    - og_image
    - twitter image
    - site map change frequency
    - sitemap priority
  - blog_posts
    - date_updated, date_created etc ...
    - sort
    - status : draft, scheduled, published
    - date_published
    - category (many to one)
    - title (input string)
    - slug (input string)
    - author (many to one) directus user collection
    - links
    - summary (textarea)
    - image
    - content (WYSIWYG)
    - seo (many to one)
    - tags (tags, json)
    - youtube_videos (list link)

- testimonials

## utiliser les ginleton collection qui ont une seule item enregistré

bien pour les globals settings par exemple

- Config
  - Globals
    - site_name- URL
    - title
    - description
    - tagline
