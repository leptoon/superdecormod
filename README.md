# Super Decor - A Supermarket Simulator Decor Mod

A comprehensive modular decoration system for Supermarket Simulator that adds non-functional decorative items to enhance store aesthetics and atmosphere.

https://www.nexusmods.com/supermarketsimulator/mods/1225

## Overview

This mod is a framework to import decorative items into Supermarket Simulator, allowing creators to distribute their 3D assets for Supermarket Simulator and players to create more personalized stores.

Some decor objects may have animations and lighting in the near future, but for now I'm just focusing on static objects for the initial release.

The mod uses a custom placement system, separate from all other objects in the game and designed to be expandable for feature improvements.

There are some notable differences between the default placement system and my custom placement system.
1. There are no dotted white borders. This border would be distracting while you're trying to be creative, especially if you have a lot of decor items and they each have their own border.
2. There are no red and green placement permission indicators. These indicators are helpful for normal furniture but they entirely mask the object texture so having them would hinder creativity. Instead, I've opted to allow full clipping of decor objects rather than attempting to restrict them.
3. Precision height and rotation controls.

### Key Features

- Base mod with modular content packs
- Complete creative freedom with unrestricted decor item placement (walls, ceilings, clipping)
- High quality custom mesh props and fixtures
- Integration with the game's existing purchase and placement systems
- Completely bypasses the placement restriction system allowing decor items to be placed anywhere in the game world
- No white outline and no color changing placement restriction indicator preserves the creative aesthetic

## Installation

1. Install Tobey's BepInEx x MelonLoader Pack
2. Download the base mod and any desired expansion packs
3. Place the mod DLLs in your BepInEx/plugins folder. The base mod contains no items, you need at least one expansion.
4. Launch the game

## Expansion Packs
The mod supports expansion packs, sort of like The Sims. I invite content creators to make their own expansion packs following my detailed tutorial with custom tools to streamline development. No coding required!

I will offer full support to content creators and to those who download and use third-party expansion packs.

I want to make it easy for creators to release expansion packs for Super Decor. With that in mind, I made a web based expansion pack generator that creators can use to automatically generate all of the code for their expansion pack.

[Expansion Pack Generator](https://leptoon.github.io/superdecormod/)

To use the pack creator:
1. Set your plugin name, author name and version number in the Pack Settings. Super Decor supports incremental expansion pack versioning.
2. Select "Add Item" and enter basic item information.
3. Move through the rest of the tabs and configure the item.
Watch the code update in real time in the collapsible code preview panel on the right side of the page.
4. On the Assets tab, you can use the built in OBJ to JSON converter to convert your 3D model into the format used by Super Decor.
Alternatively, Super Decor also supports Unity AssetBundles. The Assets tab also gives you the option to generate an asset list. This is especially helpful with expansion packs that contain a lot of items.
5. Finally, export your expansion pack using the blue Export button at the top of the page, either as a full Visual Studio project with all needed files, or as a standalone C# file.

Disclaimer: Don't release content that you didn't make unless you have explicit permission from the author. Expansion packs released with infringing content will be reported and taken down.

## Usage

1. Purchase decorative items through the in-game computer, they will be added to the bottom of the "Furnitures" section
2. Place items using the custom decor item placement system
3. Items can be freely rotated and positioned
4. Item placement is unrestricted and supports wall and ceiling mounting
5. All items can be boxed up and sold for half price like regular furniture

## License

Unless otherwise specified, all original content in the base mod (including code, assets, and documentation) and all expansion packs authored by Leptoon is protected and all rights reserved. Distribution, alteration or the sale of assets contained within the base mod or expansion packs authored by Leptoon is prohibited without explicit written permission. This does not extend to the expansion pack example code and documentation intended to facilitate the creation of third-party expansion packs, which is provided under an Apache 2.0 license. Expansion packs authored by third parties follow the respective authors license agreement.

Digital Assets in the Mod are Protected Under Copyright (c) 2025 Leptoon

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Troubleshooting

For assistance with the creation of an expansion pack, send me a message on Nexus Mods. Check the mod page for a general FAQ.

For bug reports and feature requests, please leave a comment on the Nexus mod page or send me a message.

---

This mod is not affiliated with or endorsed by the creators of Supermarket Simulator.
