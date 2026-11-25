import {isCompatible,buildExtendedCommand,extendedLabel} from './extended.js';
export function redirection(stdout,stderr) {
  return stdout && stderr ? ' > /dev/null 2>&1' : stdout ? ' > /dev/null' : stderr ? ' 2>/dev/null' : '';
}
export function commentGuide(system, detailed) {
  const lines=['# Fields support: lists (,), ranges (-), and steps (/)','#','# ┌──────── minute        (0 - 59)','# │ ┌────── hour          (0 - 23)','# │ │ ┌──── day of month  (1 - 31)','# │ │ │ ┌── month         (1 - 12)','# │ │ │ │ ┌─ day of week  (0 - 7)','# │ │ │ │ │',system?'# * * * * * username command_to_execute':'# * * * * * command_to_execute'];
  if (detailed) lines.push('#','# Sunday = 0 or 7.','# User crontabs: crontab -e','# System crontabs: /etc/crontab, /etc/cron.d/*','# Only system crontabs include a username.','#','# Special strings:','# @reboot    At cron daemon startup','# @yearly    0 0 1 1 *','# @monthly   0 0 1 * *','# @weekly    0 0 * * 0','# @daily     0 0 * * *','# @hourly    0 * * * *');
  return lines;
}
export function formatEntry({model,condition=null,system=false,username='',command='',stdout=false,stderr=false,comments='none'}) {
  const errors=[], warnings=[];
  if (!model.valid) errors.push(model.error||'Invalid schedule.');
  if (condition&&!isCompatible(model,condition)) errors.push('Expression conflicts with extended scheduling.');
  if (typeof command!=='string'||command.length>2048||!command.trim()||/[\r\n\0]/.test(command)) errors.push('Enter a single-line command (maximum 2048 characters).');
  if (system && (typeof username!=='string'||!/^[A-Za-z_][A-Za-z0-9_.-]{0,62}\$?$/.test(username.trim()))) errors.push('Enter a simple Linux account name.');
  if (typeof command==='string'&&command.includes('%')) {
    if (condition) errors.push('Percent signs in extended commands are not supported; put the command in a separate script.');
    else warnings.push('Review percent-sign escaping: cron processes percent signs before the shell.');
  }
  if (!['none','simple','detailed'].includes(comments)) errors.push('Invalid comment format.');
  if (errors.length) return {text:'',errors,warnings};
  const redirect=redirection(stdout,stderr);
  if (!condition&&redirect&&/[<>|;&]/.test(command)) warnings.push('Review how appended redirections interact with your shell command.');
  const cmd=condition?buildExtendedCommand(command.trim(),condition,redirect):command.trim()+redirect;
  const entry=[model.expression,system?username.trim():'',cmd].filter(Boolean).join(' ');
  const lines=comments==='none'?[]:commentGuide(system,comments==='detailed');
  if (condition&&comments!=='none') lines.push('#',`# ${extendedLabel(condition)} — GNU/Linux shell condition.`);
  if (lines.length) lines.push('#');
  return {text:[...lines,entry].join('\n')+'\n',errors,warnings};
}
