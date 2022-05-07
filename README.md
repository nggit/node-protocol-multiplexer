Node Protocol Multiplexer
=========================
A simple tool to serve multiple services on the same port. Written in Node.js with zero dependencies.

This program can be used to share a public port for multiple services (on private/different ports).
The private port will be selected based on the "signature" of the first packet received.
Whether it's HTTP, SSH, or etc.
```
                  ____ 127.0.0.1:22
                 |
0.0.0.0:2222 ____|____ 127.0.0.1:80
                 |
                 |____ 127.0.0.1:443
```

I know there are programs available out there for this purpose such as [sslh](https://github.com/yrutschle/sslh). This is here solely for educational purposes.

Configuration
-------------
Just edit the [.env](.env) file.

Usage
-----
Make sure to make the `run.sh` file executable:
```
chmod +x run.sh
```

And to run it:
```
./run.sh
```

If you want to run it in the background:
```
./run.sh &
```

Run in the background super-silently (detached, without any output):
````
( ./run.sh > /dev/null 2>&1 & )
````
