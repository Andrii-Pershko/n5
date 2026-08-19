'use client';

import { useEffect, useState } from 'react';
import { RoleGate } from '@/components/layout/RoleGate';
import { PAGE_SIZE, Pagination } from '@/components/ui/Pagination';
import { useT } from '@/i18n/useT';
import { api, queryString } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Asset, Paginated, PublicUser } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

type AdminUser = PublicUser & { assetsCount: number; inquiriesCount: number };

export default function AdminPage() {
  return (
    <RoleGate roles={['MANAGER']}>
      <AdminDesk />
    </RoleGate>
  );
}

function AdminDesk() {
  const t = useT();
  const token = useAppSelector((state) => state.auth.token);
  const [q, setQ] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [assetPage, setAssetPage] = useState(1);
  const [users, setUsers] = useState<Paginated<AdminUser> | null>(null);
  const [assets, setAssets] = useState<Paginated<Asset> | null>(null);
  const [error, setError] = useState('');

  async function load(nextUserPage = userPage, nextAssetPage = assetPage) {
    try {
      setError('');
      const [nextUsers, nextAssets] = await Promise.all([
        api<Paginated<AdminUser>>(
          `/admin/users${queryString({ q, page: nextUserPage, limit: PAGE_SIZE })}`,
          { token },
        ),
        api<Paginated<Asset>>(
          `/admin/assets${queryString({ q, page: nextAssetPage, limit: PAGE_SIZE })}`,
          { token },
        ),
      ]);
      setUsers(nextUsers);
      setAssets(nextAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.loadError'));
    }
  }

  useEffect(() => {
    setUserPage(1);
    setAssetPage(1);
  }, [q]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, token, userPage, assetPage]);

  async function toggleUser(user: AdminUser) {
    try {
      await api(`/admin/users/${user.id}`, {
        method: 'PATCH',
        token,
        body: { status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.updateError'));
    }
  }

  async function removeUser(user: AdminUser) {
    if (!window.confirm(t('admin.confirmDelete', { name: user.name }))) {
      return;
    }
    try {
      await api(`/admin/users/${user.id}`, { method: 'DELETE', token });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.deleteError'));
    }
  }

  async function toggleAsset(asset: Asset) {
    try {
      await api(`/admin/assets/${asset.id}`, {
        method: 'PATCH',
        token,
        body: { status: asset.status === 'PUBLISHED' ? 'SUSPENDED' : 'PUBLISHED' },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.assetUpdateError'));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('admin.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('admin.title')}</h1>
      </div>
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder={t('admin.searchPlaceholder')}
        className="w-full border border-line bg-card px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.16em] text-muted">{t('admin.users')}</h2>
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2">{t('admin.name')}</th>
                <th className="px-3 py-2">{t('admin.role')}</th>
                <th className="px-3 py-2">{t('admin.status')}</th>
                <th className="px-3 py-2">{t('admin.assetsCol')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users?.items.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <div>{user.name}</div>
                    <div className="text-xs text-muted">{user.email}</div>
                  </td>
                  <td className="px-3 py-2">{t(`roles.${user.role}`)}</td>
                  <td className="px-3 py-2">{user.status}</td>
                  <td className="px-3 py-2">{user.assetsCount}</td>
                  <td className="px-3 py-2">
                    {user.role !== 'MANAGER' && (
                      <div className="flex flex-wrap gap-3">
                        <button className="text-gold hover:text-gold-2" onClick={() => void toggleUser(user)}>
                          {user.status === 'ACTIVE' ? t('admin.suspend') : t('admin.restore')}
                        </button>
                        <button className="text-red-400 hover:text-red-300" onClick={() => void removeUser(user)}>
                          {t('admin.remove')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users && (
          <Pagination
            page={users.page}
            pageCount={users.pageCount}
            total={users.total}
            onPage={setUserPage}
          />
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.16em] text-muted">{t('admin.assets')}</h2>
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2">{t('admin.code')}</th>
                <th className="px-3 py-2">{t('admin.listingTitle')}</th>
                <th className="px-3 py-2">{t('admin.price')}</th>
                <th className="px-3 py-2">{t('admin.status')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {assets?.items.map((asset) => (
                <tr key={asset.id} className="border-t border-line">
                  <td className="px-3 py-2">{asset.publicCode}</td>
                  <td className="px-3 py-2">{asset.title}</td>
                  <td className="px-3 py-2">{formatPrice(asset.priceEur)}</td>
                  <td className="px-3 py-2">{asset.status}</td>
                  <td className="px-3 py-2">
                    <button className="text-gold hover:text-gold-2" onClick={() => void toggleAsset(asset)}>
                      {asset.status === 'PUBLISHED' ? t('admin.suspend') : t('admin.restore')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {assets && (
          <Pagination
            page={assets.page}
            pageCount={assets.pageCount}
            total={assets.total}
            onPage={setAssetPage}
          />
        )}
      </section>
    </div>
  );
}
