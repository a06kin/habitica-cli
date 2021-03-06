import R from 'ramda';
import { request, url } from './api';
import * as content from './content';
import * as user from './user';

export async function getAllUserSkills() {
  const [
    allSkills,
    stats,
  ] = await Promise.all([
    content.getAllSkillsByClass(),
    user.stats(),
  ]);

  return R.filter(
    spell => spell.level <= stats.level,
    allSkills[stats.class],
  ).map(x => ({
    id: x.id,
    label: x.label,
    mana: x.mana,
    level: x.level,
    description: x.description,
    target: x.target,
  }));
}

export async function cast({ spellId, targetId }) {
  const data = await request(url(`user/class/cast/${spellId}`, {
    targetId,
  }), {
    method: 'POST',
  });

  return data; // eslint-disable-line no-underscore-dangle
}
