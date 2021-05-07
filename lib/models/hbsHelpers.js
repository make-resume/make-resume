const _ = require("lodash");
const Handlebars = require("handlebars");
require("handlebars-helpers")();

Handlebars.registerHelper("sectionTitle", function (info, key, defaultTitle) {
	if (info.meta && info.meta.sections) {
		const sections = info.meta.sections;
		const section = _.find(sections, ["key", key]);
		if (section && section.title) return section.title;
	}
	return defaultTitle;
});

Handlebars.registerHelper("renderSections", function (sections, context) {
	const template = [];
	sections.forEach((sec) => {
		let partial = Handlebars.partials[sec.key];
		if (!partial) return;
		if (typeof partial !== "function") {
			partial = Handlebars.compile(partial);
		}
		template.push(partial(context.data.root));
	});
	return template.join("");
});
module.exports = Handlebars;
