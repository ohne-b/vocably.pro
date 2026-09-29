import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import {
  getSubscriptionProducts,
  SubscriptionProduct,
} from '../../../subscription-products';
import posthog from 'posthog-js';

type ProductResult =
  | {
      status: 'product';
      product: SubscriptionProduct;
    }
  | {
      status: 'error';
      error: string;
    }
  | {
      status: 'loading';
    };

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
  imports: [IonicModule, MatIcon, RouterLink, TranslocoModule],
})
export class SuccessPageComponent implements OnInit {
  public productResult: ProductResult = { status: 'loading' };

  public benefits = [
    'membership_selector.unlimited_translations',
    'membership_selector.unlimited_collections',
    'membership_selector.unlimited_sessions',
    'membership.unlimited_cards',
    'membership_selector.cloud_storage',
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      const priceId = params.get('priceId');
      if (!priceId) {
        console.error('No priceId');
        this.productResult = { status: 'error', error: 'No priceId' };
        return;
      }

      const subscriptionProducts = await getSubscriptionProducts();

      const product = subscriptionProducts.find((p) => p.priceId === priceId);

      if (!product) {
        console.error(`No product for priceId: ${priceId}`);
        this.productResult = {
          status: 'error',
          error: `No product for price: ${priceId}`,
        };
        return;
      }

      posthog.capture('$set', {
        $set: {
          isPaidOrTrial: true,
        },
      });
      this.productResult = { status: 'product', product };
    });
  }
}
