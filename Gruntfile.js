module.exports = function(grunt) {
	_ = require('lodash');

	var version = "0.1.4";

	var inputFolder = "./docs";
	var tempFolder = "./temp";
	var archiveFolder = "./archive";
	var outputFolder = "../mithril.elements";


	var sauceBrowsers =[
		{ browserName: 'firefox', version: '19', platform: 'XP' },
		{ browserName: "internet explorer", platform: "XP", version: "6"},
		{ browserName: "safari", platform: "OS X 10.9", version: "7"},
		{ browserName: "iPad", platform: "OS X 10.9", version: "7.1"},
		{ browserName: "opera", platform: "Linux", version: "12"},
		{ browserName: "chrome", platform: "XP", version: "26"},
		{ browserName: "chrome", platform: "Windows 8", version: "26"}
	];

	var sauceOnTestComplete = function(result, callback) {
		var request = require('request');

		var user = process.env.SAUCE_USERNAME;
		var pass = process.env.SAUCE_ACCESS_KEY;

		request.put({
			url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
			auth: { user: user, pass: pass },
			json: { passed: result.passed }
		}, function (error, response, body) {
			if (error) {
				callback(error);
			} else if (response.statusCode !== 200) {
				callback(new Error('Unexpected response status: '
					+ response.statusCode + "\n "));
			} else {
				callback(null, result.passed);
			}
		});
	};

	var sauceBaseOptions = {
		username: process.env.SAUCE_USERNAME,
		key: process.env.SAUCE_ACCESS_KEY,
		testname: "Mithril Tests " + new Date().toJSON(),
		browsers: sauceBrowsers,
		sauceConfig: {
			"record-video": false,
			"record-screenshots": false,
		},
		build: process.env.TRAVIS_JOB_ID,
		onTestComplete: sauceOnTestComplete,
		tunnelTimeout: 5,
	};
	var sauceCustomOptions = {
		testname: "Mithril Custom Tests "+ new Date().toJSON(),
		urls: ["http://127.0.0.1:8000/tests/index.html"],
	};
	_.assign(sauceCustomOptions, sauceBaseOptions);
	var sauceQunitOptions = {
		testname: "qUnit Tests "+ new Date().toJSON(),
		urls: ["http://127.0.0.1:8000/tests/e2e/test.html"],
	};
	_.assign(sauceQunitOptions, sauceBaseOptions);

	var currentVersionArchiveFolder = archiveFolder + "/v" + version;
	grunt.initConfig({
		uglify: {
			options: {banner: "/*\nMithril.Elements v" + version + "\nhttp://github.com/philtoms/mithril.elements.js\n(c) Phil Toms\nLicense: MIT\n*/", sourceMap: true},
			mithril: {src: "mithril.elements.js", dest: "mithril.elements.min.js"}
		},
		concat: {
			test: {src: ["./node_modules/mithril/mithril.js", "mithril.elements.js", "./tests/test.js", "./tests/mock.js", "./tests/mithril.elements-tests.js", "./tests/mithril-tests.js"], dest: currentVersionArchiveFolder + "/mithril.elements-tests.js"}
		},
		zip: {
			distribution: {
				cwd: currentVersionArchiveFolder + "/",
				src: [currentVersionArchiveFolder + "/mithril.elements.min.js", currentVersionArchiveFolder + "/mithril.elements.min.js.map", currentVersionArchiveFolder + "/mithril.elements.js"],
				dest: currentVersionArchiveFolder + "/mithril.elements.min.zip"
			}
		},
		replace: {
			options: {force: true, patterns: [{match: /\.md/g, replacement: ".html"}, {match: /\$version/g, replacement: version}]},
			links: {expand: true, flatten: true, src: [tempFolder + "/**/*.html"], dest: currentVersionArchiveFolder + "/"},
			index: {src: inputFolder + "/layout/index.html", dest: currentVersionArchiveFolder + "/index.html"},
			commonjs: {expand: true, flatten: true, src: [inputFolder + "/layout/*.json"], dest: currentVersionArchiveFolder},
			cdnjs: {src: "deploy/cdnjs-package.json", dest: "../cdnjs/ajax/libs/mithril.elements/package.json"}
		},
		copy: {
			style: {src: inputFolder + "/layout/style.css", dest: currentVersionArchiveFolder + "/style.css"},
			pages: {src: inputFolder + "/layout/pages.json", dest: currentVersionArchiveFolder + "/pages.json"},
			lib: {expand: true, cwd: inputFolder + "/layout/lib/", src: "./**", dest: currentVersionArchiveFolder + "/lib/"},
			tools: {expand: true, cwd: inputFolder + "/layout/tools/", src: "./**", dest: currentVersionArchiveFolder + "/tools/"},
			comparisons: {expand: true, cwd: inputFolder + "/layout/comparisons/", src: "./**", dest: currentVersionArchiveFolder + "/comparisons/"},
			unminified: {src: "mithril.elements.js", dest: currentVersionArchiveFolder + "/mithril.elements.js"},
			minified: {src: "mithril.elements.min.js", dest: currentVersionArchiveFolder + "/mithril.elements.min.js"},
			map: {src: "mithril.min.elements.js.map", dest: currentVersionArchiveFolder + "/mithril.elements.min.js.map"},
			typescript: {src: "mithril.elements.d.ts", dest: currentVersionArchiveFolder + "/mithril.elements.d.ts"},
			publish: {expand: true, cwd: currentVersionArchiveFolder, src: "./**", dest: outputFolder},
			archive: {expand: true, cwd: currentVersionArchiveFolder, src: "./**", dest: outputFolder + "/archive/v" + version},
		},
		execute: {
			tests: {src: [currentVersionArchiveFolder + "/mithril.elements-tests.js"]}
		},
		qunit: {
			all: ['tests/e2e/**/*.html']
		},
		"saucelabs-custom": {
			all:{
				options: sauceCustomOptions
			}
		},
		"saucelabs-qunit": {
			all:{
				options: sauceQunitOptions
			}
		},
		watch: {},

		connect: {
			server: {
				options: {
					port: 8888,
					base: '.'
				}
			}
		},
		clean: {
			options: {force: true},
			generated: [tempFolder]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks("grunt-replace");
	grunt.loadNpmTasks('grunt-zip');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-saucelabs');

	grunt.registerTask("build", ["test", "uglify", "zip", "replace", "copy", "clean"]);
	grunt.registerTask("test", ["concat", "execute"]);
	grunt.registerTask("default", ["build"]);

	grunt.registerTask("sauce-qunit", ["connect", "saucelabs-qunit"]);
	grunt.registerTask("sauce-custom", ["connect", "saucelabs-custom"]);
	grunt.registerTask("sauce-all", ["connect", "saucelabs-qunit", "saucelabs-custom"]);
};
