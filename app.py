import csv
from flask import Flask, jsonify, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', years=years, countries=countries, abbr=abbr)

@app.route('/static/<name>')
def static_file(name):
    return app.send_static_file(name)

@app.route('/data/<paras>')
def get_data(paras):
    paras = paras.split('&')
    return getData(paras)

@app.route('/inds')
def get_inds():
    return jsonify(ind)

@app.route('/countries')
def get_abbr():
    return jsonify(countries)

@app.route('/abbr')
def get_countries():
    return jsonify(abbr)

@app.route('/years')
def get_years():
    return jsonify(years)


def getData(paras):
    col, country, year = paras
    if country=='all':
        return jsonify([{'name': abbr[i], 'id': i, 'value': data[ind[col]][i][year]} for i in abbr])
    if year=='all':
        k = 1000 if col=='4' else 1
        return jsonify({'col': col, 'name': abbr[country], 'id': country, 'value': [{'k': i, 'v': data[ind[col]][country][i]/k} for i in years]})
    return jsonify({'name': abbr[country], 'id': country, 'value': data[ind[col]][country][year]})

def loadData():
    with open('data.csv', 'r') as fin:
        data = list(csv.DictReader(fin))
    col = [i for i in data[0]]
    ind = dict(zip(list(range(len(col))), col))
    abbr = {data[i][ind[3]]: data[i][ind[2]] for i in range(217)}

    ret = {}
    for i in range(8):
        for j in range(217):
            if j==0:
                ret[data[217*i+j][ind[0]]] = {}
            values = [float(0 if(data[217*i+j][ind[k]]=='..') else data[217*i+j][ind[k]]) for k in range(4, len(col))]
            ret[data[217*i+j][ind[0]]][data[217*i+j][ind[3]]] = dict(zip([str(k) for k in range(1960, 2017)], values))
    return ret, abbr


if __name__ == '__main__':
    data, abbr = loadData()
    ind = dict(zip([str(i) for i in range(8)], [i for i in data]))
    countries = [i for i in data[ind['0']]]
    years = [i for i in data[ind['0']][countries[0]]]
    app.run(host='0.0.0.0')
