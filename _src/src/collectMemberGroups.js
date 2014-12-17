var { Seq } = require('immutable');
var defs = require('../resources/immutable.d.json');

function collectMemberGroups(interfaceDef, options) {
  var members = {};

  if (interfaceDef) {
    collectFromDef(interfaceDef);
  }

  var groups = {'':[]};

  if (options.showInGroups) {
    Seq(members).forEach(member => {
      (groups[member.group] || (groups[member.group] = [])).push(member);
    });
  } else {
    groups[''] = Seq(members).sortBy(member => member.memberName).toArray();
  }

  if (!options.showInherited) {
    groups = Seq(groups).map(
      members => members.filter(member => !member.inherited)
    ).toObject();
  }

  return groups;

  function collectFromDef(def, name) {

    def.groups && def.groups.forEach(g => {
      Seq(g.members).forEach((memberDef, memberName) => {
        collectMember(g.title || '', memberName, memberDef);
      });
    });

    def.extends && def.extends.forEach(e => {
      var superModule = defs.Immutable.module[e.name];
      var superInterface = superModule && superModule.interface;
      if (superInterface) {
        collectFromDef(superInterface, e.name);
      }
    });

    function collectMember(group, memberName, memberDef) {
      var member = members[memberName];
      if (member) {
        if (!member.inherited) {
          member.overrides = { name, def, memberDef };
        }
        if (!member.group && group) {
          member.group = group;
        }
      } else {
        member = {
          group,
          memberName: memberName.substr(1),
          memberDef
        };
        if (def !== interfaceDef) {
          member.inherited = { name, def };
        }
        members[memberName] = member;
      }
    }
  }
}

module.exports = collectMemberGroups;
