function User(id, username, password, salt, name, surname, role, avatar) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.salt = salt;
    this.name = name;
    this.surname = surname;
    this.role = role;
    this.avatar = avatar;
}

export default User;