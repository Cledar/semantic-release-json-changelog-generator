# **semantic-release-json-changelog-generator**

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to generate JSON changelog content with [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)

| Step            | Description                                                                                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `generateNotes` | Generate JSON release notes for the commits added since the last release with [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)     |

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration).

<details>
  <summary>Example output</summary>

  ```json
  {
    "releases": [
      {
        "version": "1.1.0",
        "date": "2022-10-01",
        "commitGroups": [
          {
            "title": "Features",
            "type": "feat",
            "commits": [
              {
                "hash": "522e2ca8010c77fb76f1766dc72a0de81524cd6d",
                "subject": "some cool feature",
                "commitUrl": "https://github.com/owner/repo/commit/522e2ca8010c77fb76f1766dc72a0de81524cd6d"
              }
            ]
          }
        ],
        "compareUrl": "https://github.com/owner/repo/compare/v1.0.0...v1.1.0"
      },
      {
        "version": "1.0.0",
        "date": "2022-10-01",
        "commitGroups": [
          {
            "title": "Bug Fixes",
            "type": "fix",
            "commits": [
              {
                "hash": "9ef9e2204ba05cbfa4c62515e8ef7b689a817d8a",
                "subject": "some commit",
                "commitUrl": "https://github.com/owner/repo/commit/9ef9e2204ba05cbfa4c62515e8ef7b689a817d8a"
              },
              {
                "hash": "8dc0e690a71d5656901658f255ba33f07badf5ee",
                "subject": "some another commit",
                "commitUrl": "https://github.com/owner/repo/commit/8dc0e690a71d5656901658f255ba33f07badf5ee"
              }
            ]
          }
        ]
      }
    ]
  }
  ```
</details>

## Configuration

### Options

| Option                 | Description                                       | Default          |
|------------------------|---------------------------------------------------|------------------|
| `changelogName`        | Name of the JSON changelog file                   | CHANGELOG.json   |
| `debug`                | Debug mode                                        | false            |
| `dryRun`               | Wether to perform dry run                         | false            |
| `indent`               | Indent of JSON changelog file                     | 2                |
| `linkReferences`       | Wether to include URLs in the JSON changelog file | true             |

**NOTE:** If JSON changelog file is not preset, the plugin will create a new one, which includes previous releases' data as well.

**NOTE:** Currently, the plugin supports only `Angular` preset.
