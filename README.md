# pf2-encounter-planner
A Pathfinder 2nd Edition encounter planner

Use the tool : https://mcgode.github.io/pf2-encounter-planner

The tool has now entered its beta phase. It's functional, 
but some features might be missing. And you might find some bugs. 

## Planned features

- **Auto leveling** : Will automatically set the level up events in the 
timeline to always keep the players at the maximum possible level
- **Guide**: A user-friendly guide for explaining to new users how to use the tool. 
Will most likely be a dedicated web page
- **Online saving ?**: Allow users to log in to a 3rd party online service like Google
to save their data online instead of their browser local storage. Will require some 
investigating. 
- **Better fight builder ?**: Perhaps down the line I'll be setting up a dedicated tab
for building fights specifically. The tab would include a list of creatures from the 
PF2 bestiaries, and perhaps some other imported monsters.
- **Localization?**: See about making a localized version of the tool.


## About this tool

This tool was inspired by a spreadsheet by Dalvyn 
([original sheet](https://docs.google.com/spreadsheets/d/147Qwk0-nl1tvDNCyYBzXXskMAaU4MQJ53RYa4qVEIbI/edit?usp=sharing), in French).
That spreadsheet had a few issues and shortcomings that were not easy to 
solve by just making a better spreadsheet. As a consequence, I decided to 
make an upgraded version using a web app, hosted on Github Pages.

## Contributing

You are free to contribute to this repository. I'll try to come back every 
once in a while to see if anything has happened and requires my attention.

Don't hesitate to report a bug if you think you've seen one.

If you want to add edit / add some code, I just ask that you follow the general project structure :
- Data model stuff goes to the `src` directory
- UI code goes to `index.html`

You may also want to add your credentials to the files you want to add/edit
if that concerns you.

You are free to fork the tool at any time.

## License

This tool is published under the [MIT license](https://opensource.org/licenses/MIT). 
