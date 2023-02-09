---
title: "Cold Booting into Performance Testing"
date: 2023-02-04T16:50:25-03:00
tags:
- performance
- testing
---

Please note, some information may be altered to preserve project confidentiality.

## How it all started 

At around the middle point of 2022, our team got instructed by a subject matter expert on how to design and conduct a performance test, 
this included the use of the tool k6 and Grafana as an observability platform for our metric dashboards.

Which was all well and good, assuming we'd get to use it.

<!--more-->

## The present

About 8 months later, the opportunity to put our learnings into practice finally presents itself... 
except by this point, the ebb and flow of project work has washed off the knowledge from our minds. It can't be that hard, can it?

After all, our architect tells me they expect about 20k concurrent users.

### Back to Javascript

Dusting off my notes, it all started to come back to me. The script-making in good old .js files, calling the tools and grouping
steps BDD-style, the works.

### The first problem

All of these tests, however, we being run under my real account for the purposes of acquiring a real JWT (I would come to love these
little buggers). If we were to run these tests through the originally-stated 20k users, I'd probably need a way to give them their
own tokens for authentication. 

Cue some quick searches about base64 for k6, a handy secret key given to me by our architect and I had my own JWT generator ingrained
into my script.

```
const tokenPayload = json.stringify({
	userId: uuidv4(),
	exp: 999999999,	
	sub: "load-testing",
});

const jwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
	${encoding.base64encode(tokenPayload, "rawstd")}.
	very-secret-key`;
```

### The (smaller) second problem

I quickly realised I was going to need unique usernames for each Virtual User, and there was no way they could be allowed to collide.
Thankfully, this was quickly solved with the use of good old `uuidv4()` again 

```
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const randomUUID = uuidv4();
``` 

### Not the first or the second but a secret third problem

In a twist of events, I was informed by the project architect that the number expectations on launch were no longer 20k, but 200k.
Assuming a number is still a number, I was asked whether this changed our game plan at all, to which I naively answered "I don't
really think so" (this turned out to be **wrong**).

Taking a step back to look at our framework for performance testing, pushing the code repo triggers a CI/CD pipeline that culminates 
in running the script through k6 on a bunch of kubernetes pods. The pod configuration used so far was in no way enough to actually 
generate the expected load of 200k.

This instigated a series of talks with our architects and DevOps, helping me figure out *how* and *when* the pods would scale, allowing
me to more precisely calibrate the values in my tests so as to meet the expected load.

### The result so far

<!--screenshot of Grafana graphs-->

The last week, we've managed to hit our endpoints up to 3k times *per second* each, so far with evenly spread loads in the name of getting
the hang of whatever we're doing. Next step? Staged tests with interesting spikes to verify scaling capabilities.
