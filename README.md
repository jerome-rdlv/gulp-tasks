## Todo

@see https://github.com/ehmicky/dev-tasks/tree/main

Should use this to allow task reuse and configuration:
@see https://gulpjs.com/docs/en/advanced/creating-custom-registries

- [x] Drop config in favor of code configuration : should allow to add new tasks, or override existing ones locally
- [x] Move imagemin and cherio config to modules with ability to override
- [x] Move to JSDOM and drop cheerio
- [x] Move cachebust-css-refs to postcss plugin (to prevent brittle regex matching)
- [ ] Verify gulp-sourcemaps for JS and CSS
- [ ] Move most of the dependencies to peer and dev (needed by the tasks, not by the main package)

Maybe:

- [ ] Improve testing data with real page, with simple styles and navigation
- [ ] Use [workspaces](https://yarnpkg.com/features/workspaces) to allow separation of tasks as several packages: for
  task example, and its dependencies
- [ ] Add a build step to separate build dependencies from projects dependencies?
