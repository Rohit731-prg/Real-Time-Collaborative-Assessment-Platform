import bcrypt from "bcryptjs";

export const createHashedPassword = (password) => {
    return bcrypt.hash(password, 10);
}

export const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
}