'use client'

import { Row } from '@/components/layout/row'
import { Col } from '@/components/layout/col'
import { formatMoney } from '@/utils/formatting'
import { CharityData } from '../dummy-data'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  GlobeAltIcon,
  CalendarIcon
} from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import Link from 'next/link'

interface CharityHeaderProps {
  charity: CharityData
}

export function CharityHeader({ charity }: CharityHeaderProps) {
  const isPositive = charity.priceChange >= 0
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <Row className="items-start justify-between">
        <Col className="gap-4">
          <Row className="items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {charity.ticker.substring(0, 2)}
              </span>
            </div>
            <Col className="gap-1">
              <h1 className="text-3xl font-bold text-gray-900">{charity.name}</h1>
              <Row className="items-center gap-3 text-gray-600">
                <span className="text-lg font-medium">{charity.ticker}</span>
                <Row className="items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">Founded {charity.founded}</span>
                </Row>
                <Link 
                  href={charity.website}
                  target="_blank"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  <span className="text-sm">Website</span>
                </Link>
              </Row>
            </Col>
          </Row>

          <p className="text-gray-700 max-w-2xl">{charity.description}</p>
        </Col>

        <Col className="items-end gap-2">
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatMoney(charity.currentPrice)}
            </div>
            <div className="text-sm text-gray-600">per certificate</div>
          </div>
          
          <Row className={clsx(
            'items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
            isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {isPositive ? '+' : ''}{charity.priceChange.toFixed(2)}% today
          </Row>
        </Col>
      </Row>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div>
          <div className="text-sm text-gray-600">Market Cap</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatMoney(charity.marketCap)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">24h Volume</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatMoney(charity.volume24h)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Shareholders</div>
          <div className="text-lg font-semibold text-gray-900">
            {charity.shareholders.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Price Range (30d)</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatMoney(Math.min(...charity.priceHistory.map(p => p.price)))} - {formatMoney(Math.max(...charity.priceHistory.map(p => p.price)))}
          </div>
        </div>
      </div>
    </div>
  )
}