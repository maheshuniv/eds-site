# WKND Adventures Homepage Migration Plan

**Source page:** https://wknd-adventures.com/index.html
**Target:** Homepage (`/index`) in the `eds-site` project (Document Authoring content source)
**Page type:** Standard content page. The Commerce and Forms add-ons aren't needed.

> **Status: approved, but not started.** Plan mode is still on, so I can't run anything yet. That includes checking whether the source page loads. To start, switch from **Plan** mode to **Execute** mode and send any message, such as "start". I'll then begin at step 0 and go through the checklist without stopping, except to ask you questions.

## Starting point

- **Project type:** Document Authoring (DA), set up for `maheshuniv/eds-site`
- **Blocks already in the project:** hero, cards, columns, header, footer, fragment, widget. I'll reuse these where they fit before creating new ones.
- **Repository:** an empty template on `main`. The code work will go on a new branch, `migrate-homepage`, not on `main` directly.

## Approach

1. **Look at the source page:** take a screenshot, save the page's content and metadata, and download its images.
2. **Map out the page:** split it into sections and decide which parts are plain text and which become blocks (for example hero, cards, columns, teasers).
3. **Match to blocks:** compare each part against the existing blocks. If one matches about 80% or more, I'll reuse it and add a variant if needed. If nothing matches, I'll create a new block.
4. **Build the import tooling:** write a page template and the scripts that clean the page and pull each block's content out of it.
5. **Import the content:** bundle the import script and run it to produce the homepage content in AEM format.
6. **Match the styling:** apply the site's fonts, colors and spacing project-wide, then style each block to look like the original.
7. **Migrate the header and footer:** rebuild the navigation (desktop and mobile) and the footer from the source site.
8. **Check the result:** compare the preview against the original side by side and fix any differences in layout, styling or content.

## Checklist

### 0. Set up
- [ ] **You:** switch to Execute mode and send a message to start
- [ ] Create the `migrate-homepage` branch from `main`
- [ ] Start the local preview server

### 1. Look at the source page
- [ ] Load the source page and confirm it's reachable and not blocked by bot protection
- [ ] Save the page's content, metadata (title, description, social image) and images
- [ ] Take full-page screenshots on desktop and mobile for reference

### 2. Map out the page
- [ ] Find the section boundaries and the order of content in each section
- [ ] Decide for each part whether it's plain text or a block
- [ ] Give each block variant a name (for example `hero-adventure`, `cards-featured`)

### 3. Match to blocks
- [ ] Compare each variant against the existing hero, cards and columns blocks
- [ ] Note which blocks get reused, which get a variant added, and which are new
- [ ] Add a page selector for each block to the page template

### 4. Build the import tooling
- [ ] Write a parser for each block variant and check it works
- [ ] Write the page-cleanup and section scripts (remove cookie banners, tracking code, duplicate header and footer)
- [ ] Bundle everything into one import script

### 5. Import the content
- [ ] Run the import for `https://wknd-adventures.com/index.html`
- [ ] Confirm the homepage content was created and that images and links resolve
- [ ] Confirm the page metadata block is filled in

### 6. Build blocks and match styling
- [ ] Create or update block code for any new or changed variants
- [ ] Copy the site-wide design: fonts, color palette, spacing and button styles
- [ ] Style each block to match the original (desktop and mobile)
- [ ] Run the linter on all changed JS and CSS

### 7. Migrate the header and footer
- [ ] Rebuild the header and navigation (desktop, mobile, and any dropdown menus)
- [ ] Rebuild the footer (link columns, social links, legal text)

### 8. Check the result
- [ ] Check the homepage preview: every section is present and blocks are decorated correctly
- [ ] Compare the whole page against the original visually and fix the differences
- [ ] Confirm there are no console errors or broken images or links

### 9. Hand off
- [ ] Commit the code to `migrate-homepage` (only once you approve)
- [ ] If you want a pull request, include the branch preview link: `https://migrate-homepage--eds-site--maheshuniv.aem.page/`
- [ ] Remind you that merging to `main` ships the code, but the content has to be published separately in Document Authoring

## Optional add-on

A **Figma** add-on is available. It can take design details and content from Figma files. You don't need it here because the source is a live website. If you also have Figma designs for this site and want them used, tell me and I'll turn it on.

## Risks and notes

- If the source site blocks automated access, the page capture may need a fallback method.
- Content is created through the import script only, never written by hand, so the import can be repeated later for similar pages.
- The shared `aem.js` script isn't changed. Styles are scoped to each block.
