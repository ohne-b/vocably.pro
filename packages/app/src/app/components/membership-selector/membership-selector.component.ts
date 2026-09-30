import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { getPaddleInstance } from '@paddle/paddle-js';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import {
  getSubscriptionProducts,
  SubscriptionInterval,
  SubscriptionProduct,
} from '../../subscription-products';
import { UserStaticMetadata } from '@vocably/model';
import { getUserStaticMetadata } from '@vocably/api';
import { appBaseUrl } from '../../../app-base-url';

const parsePrice = (price: string): number =>
  parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

@Component({
  selector: 'app-membership-selector',
  templateUrl: './membership-selector.component.html',
  styleUrls: ['./membership-selector.component.scss'],
  imports: [MatIcon, NgFor, TranslocoModule],
})
export class MembershipSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  subscriptionProducts: SubscriptionProduct[] | null = null;
  staticMetadata: UserStaticMetadata | null = null;
  featuredInterval: SubscriptionInterval = 'year';

  constructor(
    private authService: AuthService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    getSubscriptionProducts().then((products) => {
      this.subscriptionProducts = products;
    });

    getUserStaticMetadata().then((result) => {
      if (result.success) {
        this.staticMetadata = result.value;
      }
    });
  }

  savePercent(product: SubscriptionProduct): number {
    const total = parsePrice(product.total);
    const maxTotal = parsePrice(product.maxTotal);
    if (!total || !maxTotal || total >= maxTotal) {
      return 0;
    }

    return Math.round((1 - total / maxTotal) * 100);
  }

  onSelect(product: SubscriptionProduct) {
    this.authService.fetchUserData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userData) => {
        const paddleInstance = getPaddleInstance();
        if (!paddleInstance) {
          console.error('No paddle instance');
          return;
        }
        paddleInstance.Checkout.open({
          items: [
            {
              priceId: product.priceId,
            },
          ],
          customer: {
            email: userData.email,
          },
          customData: {
            revenue_cat_id: userData.sub,
          },
          settings: {
            locale: this.transloco.getActiveLang(),
            successUrl: appBaseUrl + `/subscribe/success/${product.priceId}`,
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
