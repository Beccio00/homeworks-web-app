import sqlite3 from "sqlite3";
import crypto from "crypto";
import db from "../data/db.mjs";
import User from "../models/userModel.mjs";

export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            } else {
                const user = new User(
                    row.id,
                    row.username,
                    undefined,
                    undefined,
                    row.name,
                    row.surname,
                    row.role,
                    row.avatar
                );

                const saltBuffer = Buffer.from(row.salt, "hex");

                crypto.scrypt(password, saltBuffer, 32, function (err, hashedPassword) {
                    if (err) {
                        reject(err);
                    }

                    if (
                        !crypto.timingSafeEqual(
                            Buffer.from(row.password, "hex"),
                            hashedPassword
                        )
                    ) {
                        resolve(false);
                    } else {
                        resolve(user);
                    }
                });
            }
        });
    });
}
