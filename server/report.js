export function pdiSummary(defects) {
  const total = defects.length
  const resolved = defects.filter((d) => d.status === 'resolved').length
  const rejected = defects.filter((d) => d.status === 'rejected').length
  const open = defects.filter((d) => d.status === 'new' || d.status === 'in_repair').length
  return { total, resolved, rejected, open, fit: open === 0 }
}

export function pdiHtml(vin, defects, types) {
  const summary = pdiSummary(defects)

  function typeName(typeId) {
    const t = types.find((t) => t.id === typeId)
    return t ? t.name : typeId
  }

  const rows = defects
    .map(
      (d, i) =>
        '<tr><td>' + (i + 1) + '</td><td>' + d.zone + '</td><td>' + typeName(d.typeId) +
        '</td><td>' + d.severity + '</td><td>' + d.status + '</td><td>' + (d.comment || '') +
        '</td><td>' + (d.createdAt || '') + '</td></tr>'
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Отчёт PDI — ${vin}</title>
<style>
body { font-family: sans-serif; margin: 30px; }
table { border-collapse: collapse; }
td, th { border: 1px solid #999; padding: 4px 10px; }
.fit { color: green; }
.notfit { color: red; }
</style>
</head>
<body>
<h1>Отчёт PDI по кузову ${vin}</h1>
<table>
<tr><th>N</th><th>Зона</th><th>Тип</th><th>Серьезность</th><th>Статус</th><th>Комментарий</th><th>Дата</th></tr>
${rows || '<tr><td colspan="7">дефектов нет</td></tr>'}
</table>
<p>Всего: ${summary.total}, устранено: ${summary.resolved}, отклонено: ${summary.rejected}, открыто: ${summary.open}</p>
<h2 class="${summary.fit ? 'fit' : 'notfit'}">
Годен к выдаче: ${summary.fit ? 'ДА' : 'НЕТ'}
</h2>
</body>
</html>`
}
