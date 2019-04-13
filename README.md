# Automention

Automatically mention users in an issue/PR based on github labels.

> NOTE: Automention requires Github Actions to be enabled on your repo, and Actions is still in beta.

## Intro

Github's notifications system is lacking when you have a monorepo with lots of sub-projects and contributors. `Automention` makes sure the right people get notified whenever their attention is needed.

It's an easy install github action that `@mention`s one or more users based on the labels of an issue/PR.

Consider [Storybook](https://github.com/storybooks/storybook), which has 50+ packages and 650+ contributors and the following `Automention` configuration:

```yml
'app: angular': ['kroeder', 'igor-dv']
'app: react-native': ['benoitdion']
'app: vue': ['backbone87']
'addon: a11y': ['CodeByAlex', 'Armanio', 'jsomsanith']
typescript: ['kroeder', 'gaetanmasse', 'ndelangen']
# ...
```

Whenever an Angular issue comes in, `Automention` will comment:

```
Automention: @kroeder @igor-dv you've been tagged! Can you give a hand here?
```

This way `@kroeder` and `@igor-dv` can focus on Angular messages if they want, by only subscribing to messsages that `@mention` them.

If an issue is re-labeled, automention updates or deletes the comment as you would expect.

## Install

Install `Automention` in two easy steps:

1. Add to your actions in `.github/main.workflow`
2. Configure your notifications in `automention.yml`

First, add automention to your github workflow `.github/main.workflow`.

```
action "Automention" {
  uses = "shilman/automention@master"
  secrets = ["GITHUB_TOKEN"]
}

workflow "Automention PR" {
  on = "pull_request"
  resolves = "Automention"
}

# See full list of events below...
```

For a full configuration, see this [example workflow](docs/example.workflow)

By default, Automention will run but won't take any actions. I recommend adding it unconfigured first, then configuring it after you've seen it run. After you've pushed this change to your workflwo, trigger `Automention` by taking any of the actions you've set up in the workflow (e.g. create a new PR). You should be able to see the action run in your repo's `Actions` tab.

## Configuration

Configuration is even easier, simply create a file `.github/automention.yml` with key value pairs corresponding to issue labels and list of users to notify:

```yml
label1: ['user1', 'user2']
label2: ['user1']
```

If a PR or issue is labeled with more than one label, `Automention` will mention the _union_ of all users, as you would expect.

## Credits

- Inspired by [Storybook](https://github.com/storybooks/storybook)
- Built with [Actions toolkit](https://github.com/JasonEtco/actions-toolkit)
