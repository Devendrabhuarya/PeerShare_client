'use client';
import React, { useState, createContext } from 'react';

export const UserDataContext = createContext<any>(null);

export function UserDataProvider(props: any) {
    const [user, setUser] = useState<Object | null>(null);
    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {props.children}
        </UserDataContext.Provider>
    )
}

