import chalk from 'chalk'

function info(...messages) {
  log(chalk.cyan(...messages))
}

function error(...messages) {
  log(chalk.red(...messages))
}

function log(...messages) {
  const dateTime = new Date().toISOString()
  console.log(chalk.gray(`[${dateTime}]`), ...messages)
}

export default { info, error }